import { CSSProperties, FC, HTMLAttributes, MouseEvent } from 'react'

declare const OperationHeader: FC

interface OperationDeleteProps {
  title?: string
  onClick(): void
  className?: string
  style?: CSSProperties
}

declare const OperationDelete: FC<OperationDeleteProps>

interface OperationDetailProps {
  href?: string
  open?: boolean
  onClick?(event: MouseEvent<HTMLDivElement>): void
  className?: string
  style?: CSSProperties
}

declare const OperationDetail: FC<OperationDetailProps>

declare const OperationCell: FC<HTMLAttributes<HTMLDivElement>>

interface OperationRowEditProps {
  isEditing: boolean
  onClick?(): void
  onSave?(): void
  onCancel?(): void
}

declare const OperationRowEdit: FC<OperationRowEditProps>

interface OperationIconTipProps {
  tip: string
}

declare const OperationIconTip: FC<OperationIconTipProps>

export {
  OperationHeader,
  OperationDelete,
  OperationDetail,
  OperationCell,
  OperationRowEdit,
  OperationIconTip,
}
