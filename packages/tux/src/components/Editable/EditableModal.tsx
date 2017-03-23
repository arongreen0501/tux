import React from 'react'
import classNames from 'classnames'

import ModelCreator from '../ModelCreator'

export interface EditableModalProps {
  model: any,
  children?: any,
  onChange: Function,
  className: string,
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
    const { model, children, className } = this.props
    const isEditing = this.context.tux && this.context.tux.isEditing

    const classes = classNames(
      className,
      'EditableModal',
      isEditing && 'is-editing',
    )

    return (
      <div className={classes} onClick={() => {isEditing && this.onEdit()}}>
        {children}
        {isEditing && <ModelCreator model={model} />}
        <style jsx>{`
          .EditableModal.is-editing:hover {
            cursor: pointer;
            outline: 1px dashed rgba(128, 128, 128, 0.7);
            outline-offset: 10px;
          }
        `}
        </style>
      </div>
    )
  }
}

export default EditableModal
