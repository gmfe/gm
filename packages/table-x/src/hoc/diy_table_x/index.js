import React, { useState, useMemo, useRef, useEffect } from 'react'
import { getLocale } from '@gmfe/locales'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Storage, Popover } from '@gmfe/react'
import SVGSetting from '../../../svg/setting.svg'
import {
  TABLE_X,
  TABLE_X_SELECT_ID,
  TABLE_X_EXPAND_ID,
  TABLE_X_DIY_ID,
  getColumnKey,
  OperationIconTip
} from '../../util'
import TableX from '../../base'
import { devWarn } from '@gm-common/tool'
import DiyTableXModal from './components/diy_table_x_modal'

/**
 * 把selector, expander 分离出来,不参与diy
 * @param columns
 * @returns {[][]}
 */
function splitColumns(columns) {
  const notDiyCols = []
  const diyCols = []
  for (const item of columns) {
    if ([TABLE_X_EXPAND_ID, TABLE_X_SELECT_ID].includes(item.id)) {
      notDiyCols.push(item)
    } else {
      diyCols.push(item)
    }
  }
  return [notDiyCols, diyCols]
}

/**
 * 生成新的columns
 * @param initColumns 原始columns
 * @param mixColumns 需要混合的columns(优先取这里的值)
 * @returns {(*[]|Array)[]}
 */
function generateDiyColumns(initColumns, mixColumns) {
  const [notDiyCols, diyCols] = splitColumns(initColumns)
  const mixColumnsMap = {}
  _.forEach(mixColumns, (item, index) => {
    item.sortNumber = index
    mixColumnsMap[item.key] = item
  })
  let diyColumns = _.map(diyCols, column => {
    const key = getColumnKey(column)
    // 能获取 key 才可能使用 diy
    if (key === null) {
      return column
    }

    // col 默认显示，以及 默认开启diy
    const { show = true, diyEnable = true } = column
    const newColumn = {
      ...column,
      key, // 把key记录下来,作为这个列的唯一标识
      show,
      diyEnable
    }

    // localstorage中储存的列
    const localItem = mixColumnsMap[key]
    // localstorage的值覆盖初始值
    if (localItem) {
      newColumn.show = localItem.show
      newColumn.sortNumber = localItem.sortNumber
    }
    return newColumn
  })

  diyColumns = _.sortBy(diyColumns, function(o) {
    return o.sortNumber
  })

  return [notDiyCols, diyColumns]
}

/**
 * 过滤多余数据，避免复杂数据出现JSON循环引用报错问题
 * @param columns
 * @returns {Array}
 */
function getStorageColumns(columns) {
  return _.map(columns, col => {
    const { key, show, diyEnable } = col
    return { key, show, diyEnable }
  })
}

function diyTableXHOC(Component) {
  const DiyTableX = ({ id, columns, diyGroupSorting, ...rest }) => {
    // 没id强制报错
    devWarn(() => {
      if (id === undefined) {
        throw Error('DiyTableX必须要有id！')
      }
    })

    // 只需要执行第一遍就可以了，使用函数
    const [diyCols, setDiyCols] = useState(
      () => generateDiyColumns(columns, Storage.get(id) || [])[1]
    )

    useEffect(() => {
      setDiyCols(generateDiyColumns(columns, Storage.get(id) || [])[1])
    }, [columns])

    const popoverRef = useRef()

    const handleDiyColumnsSave = cols => {
      setDiyCols(cols)
      Storage.set(id, getStorageColumns(cols))
    }

    const handleCancel = () => {
      popoverRef.current.apiDoSetActive(false)
    }

    const _columns = useMemo(() => {
      const [notDiyCols, cols] = generateDiyColumns(columns, diyCols)
      return [
        {
          id: TABLE_X_DIY_ID,
          width: TABLE_X.WIDTH_FUN,
          maxWidth: TABLE_X.WIDTH_FUN,
          accessor: TABLE_X_DIY_ID,
          fixed: 'left',
          thClassName: 'gm-table-x-icon-column',
          tdClassName: 'gm-table-x-icon-column',
          Cell: () => null, // 只是用来占据空间
          Header: () => (
            <Popover
              ref={popoverRef}
              showArrow
              offset={-10}
              popup={
                <DiyTableXModal
                  diyGroupSorting={diyGroupSorting}
                  columns={cols}
                  onSave={handleDiyColumnsSave}
                  onCancel={handleCancel}
                />
              }
            >
              <div className='gm-table-x-icon'>
                <OperationIconTip tip={getLocale('表头设置')}>
                  <div>
                    <SVGSetting className='gm-cursor gm-text-hover-primary' />
                  </div>
                </OperationIconTip>
              </div>
            </Popover>
          )
        },
        ...notDiyCols,
        ...cols
      ]
    }, [columns, diyCols])

    return <Component {...rest} id={id} columns={_columns} />
  }

  DiyTableX.propTypes = {
    ...TableX.propTypes,

    id: PropTypes.string.isRequired,
    /** 分组排序 */
    diyGroupSorting: PropTypes.array.isRequired,
    /** column 需要有 diyGroupName 字段 和 （Header | diyItemText） */
    columns: props => {
      _.each(props.columns, column => {
        const key = getColumnKey(column)
        if (
          key &&
          ![TABLE_X_SELECT_ID, TABLE_X_EXPAND_ID].includes(column.id)
        ) {
          if (!_.isString(column.Header) && !column.Header) {
            console.error('column need diyItemText', column)
          }
          if (!column.diyGroupName) {
            console.error('column need diyGroupName', column)
          }
        }
      })
    }
  }

  return DiyTableX
}

export default diyTableXHOC
