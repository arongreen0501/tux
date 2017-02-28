import React from 'react'
import { tuxColors } from '../../styles'
import { InputStyles, buttonStyles } from './styles'

interface Field {
  id: string
  value: string
  label: string
  helpText: string
  onChange: (e: React.FormEvent<any>) => void
}

interface FieldComponent {
  id: string
  type: string
  control: {
    widgetId: string
  }
}

export interface State {
  fullModel: any | null
  typeMeta: any | null
}

const TextField = ({ id, value, label, helpText, onChange }: Field) => (
  <div className="Input">
    <label className="InputLabel">{label}</label>
    <input className="InputField" label={label} id={id} value={value} onChange={onChange}/>
    <style jsx>{`
      .InputLabel {
        color: ${InputStyles.labelTextColor};
        font-size: 14px;
        line-height: 24px;
      }
      .InputField {
        border-radius: 3px;
        border: 1px solid ${InputStyles.borderColor};
        color: ${tuxColors.textDark};
        margin: 5px 0;
        padding: 10px;
        width: 100%;
      }
      `}</style>
    </div>
  )

const MarkdownField = TextField

function componentForField({ id, type, control: { widgetId } }: FieldComponent) {
  if (type === 'Array')
    return null
  if (widgetId === 'markdown') {
    return MarkdownField
  } else {
    return TextField
  }
}

class TuxModal extends React.Component<any, State> {
  static contextTypes = {
    tux: React.PropTypes.object,
  }

  state: State = {
    fullModel: null,
    typeMeta: null,
  }

  async componentDidMount() {
    const { model } = this.props

    const [
      fullModel,
      typeMeta,
    ] = await Promise.all([
      this.context.tux.adapter.load(model),
      this.context.tux.adapter.getSchema(model),
    ])

    this.setState({
      fullModel,
      typeMeta,
    })
  }

  onChange(event: React.ChangeEvent<any>, type: {id: string}) {
    const { fullModel } = this.state
    const field = fullModel.fields[type.id]
    field['en-US'] = event.target.value
    this.setState({fullModel})
  }

  onCancel = () => {
    this.props.onClose()
  }

  onSubmit = async(event: React.FormEvent<any>) => {
    event.preventDefault()

    const { fullModel } = this.state
    await this.context.tux.adapter.save(fullModel)
    this.props.onClose(true)
  }

  renderField = (type: any) => {
    const helpText = type.control.settings && type.control.settings.helpText
    const InputComponent = componentForField(type)
    const field = this.state.fullModel.fields[type.id]
    const value = field && field['en-US']

    if (!InputComponent) {
      return null
    }
    return (
      <div key={type.id}>
        <InputComponent id={type.id} value={value} label={type.name} helpText={helpText}
                        onChange={event => this.onChange(event, type)}/>
      </div>
    )
  }

  render() {
    const { fullModel, typeMeta } = this.state

    return (
      <div className="TuxModal">
        {fullModel ? (
          <form onSubmit={this.onSubmit}>
            <div className="TuxModal-topBar">
              <h1 className="TuxModal-title">Editing component <strong className="TuxModal-componentName">{typeMeta.name}</strong></h1>
              <div className="TuxModal-buttons">
                <button className="TuxModal-button" label="Cancel" onClick={this.onCancel}>Cancel</button>
                <button className="TuxModal-button TuxModal-button--green" type="submit" label="Save">Save</button>
              </div>
            </div>
            <div className="TuxModal-content">
              {typeMeta.fields.map(this.renderField)}
            </div>
          </form>
        ) : (
          'Loading'
        )}
        <style jsx>{`

          .TuxModal {
            background: #F3F5F7;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
            margin-left: auto;
            max-width: 60%;
            height: 100%;
            padding: 30px;
          }

          .TuxModal-topBar {
            display: flex;
            justify-content: space-between;
            padding-bottom: 20px;
          }

          .TuxModal-title {
            color: ${tuxColors.textDark};
            font-size: 25px;
            font-weight: 400;
            margin: 0;
          }

          .TuxModal-componentName {
            text-transform: capitalize;
          }

          .TuxModal-buttons {
            display: flex;
            justify-content: flex-end;
          }

          .TuxModal-button {
            background: ${buttonStyles.backgroundColor};
            border-radius: 2px;
            border: 1px solid ${buttonStyles.borderColor};
            color: ${buttonStyles.textColor};
            cursor: pointer;
            display: inline-block;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.3;
            margin: 0;
            padding: 10px 24px;
            text-align: center;
            vertical-align: baseline;
          }

          .TuxModal-button + .TuxModal-button {
            margin-left: 10px;
          }

          .TuxModal-button.TuxModal-button--green {
            color: #FFF;
            background: ${buttonStyles.greenTheme.backgroundColor};
            border-color: ${buttonStyles.greenTheme.borderColor};
          }
        `}</style>
      </div>
    )
  }
}

export default TuxModal
