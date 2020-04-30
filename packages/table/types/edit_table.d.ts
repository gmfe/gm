import { PropsWithChildren, ReactElement } from 'react'
import { BaseTableProps } from './base'

declare const EditTable: <Original extends { [key: string]: unknown }>(
  props: PropsWithChildren<BaseTableProps<Original>>
) => ReactElement
export default EditTable
