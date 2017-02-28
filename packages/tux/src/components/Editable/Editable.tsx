import React from 'react'
import EditableInline from './EditableInline'
import EditableModal from './EditableModal'

export interface EditableProps {
  model : any,
  field : string | Array<string>,
  onChange : Function,
  children : any,
  className : string,
}

class Editable extends React.Component<EditableProps, any> {
  static contextTypes = {
    tux: React.PropTypes.object,
  }

  render() {
    const { children, field, model, onChange, className } = this.props
    const isEditing = this.context.tux && this.context.tux.isEditing

    if (field) {
      return <EditableInline model={model} field={field} />
    }

    return (
      <EditableModal className={className} model={model} onChange={onChange}>
        {children}
      </EditableModal>
    )
  }
}

export default Editable
