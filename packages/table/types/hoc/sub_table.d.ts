import { ComponentType, ForwardRefExoticComponent, RefAttributes } from 'react'
import BaseTable from '../base'

interface PropsGeneric<Original extends { [key: string]: unknown }> {}

declare const subTableHOC: <
  Original extends { [key: string]: unknown },
  Props extends PropsGeneric<Original>
>(
  Component: ComponentType<Props>
) => ForwardRefExoticComponent<Props & RefAttributes<BaseTable<Original>>>
export default subTableHOC
