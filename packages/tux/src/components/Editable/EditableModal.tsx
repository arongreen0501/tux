import React from 'react'
import classNames from 'classnames'

export interface EditableModalProps {
  model: any,
  children?: any,
  onChange: Function,
  className: string,
  tagName: string,
}

class EditableModal extends React.Component<EditableModalProps, any> {
  static contextTypes = {
    tux: React.PropTypes.object,
  }

  async onEdit(): Promise<void> {
    const { onChange, model } = this.props
    const { tux } = this.context
    const isEditing = tux && tux.isEditing
    const didChange = await tux.editModel(model)
    if (isEditing && didChange && onChange) {
      onChange()
    }
  }

  render() {
    const { model, children, tagName, className } = this.props
    const isEditing = this.context.tux && this.context.tux.isEditing
    // const RootComponent = tagName || 'div'

    return (
      <div className={classNames(className, 'EditableModal', isEditing && 'is-editing')} onClick={() => this.onEdit()}>
        {children}
        <style jsx>{`
          .EditableModal.is-editing {
            cursor: pointer;
          }
          .EditableModal.is-editing, .EditableModal.is-editing > * {
            outline: 1px solid aquamarine !important;
          }
        `}</style>
      </div>
    )
  }
}

export default EditableModal
