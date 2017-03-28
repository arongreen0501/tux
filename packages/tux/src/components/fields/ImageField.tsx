import React from 'react'
import classNames from 'classnames'
import { get } from '../../utils/accessors'
import { input } from '../../theme'
import BrowseField from './BrowseField'

export interface ImageFieldProps {
  field: string | Array<string>,
  id: string,
  imageUrl: string,
  name: string,
  onChange: Function,
  value: any,
}


class ImageField extends React.Component<ImageFieldProps, any> {
  static contextTypes = {
    tux: React.PropTypes.object,
  }

  constructor(props: ImageFieldProps) {
    super(props)

    this.state = {
      imageUrl: '',
      fullModel: null,
    }
  }

  async componentDidMount() {
    const { value } = this.props

    let fullModel = null
    if (value instanceof Object) {
      fullModel = await this.context.tux.adapter.loadAsset(value)
    } else {
      fullModel = this.context.tux.adapter.createEmptyAsset(value)
    }

    this.setState({
      fullModel
    })
  }

  async componentWillReceiveProps(props: ImageFieldProps) {
    if (!props.value) {
      return
    }

    const nextValueId = this.context.tux.adapter.getIdOfEntity(props.value)
    const currentValueId = this.context.tux.adapter.getIdOfEntity(this.props.value)

    if ((nextValueId !== currentValueId) && nextValueId !== null) {
      const fullModel = await this.context.tux.adapter.loadAsset(props.value)

      this.setState({
        fullModel
      })
    }
  }

  onFileChange = async(files: FileList) => {
    const { onChange } = this.props

    this.setState({
      isLoadingImage: true,
    })

    const asset = await this.context.tux.adapter.createAssetFromFile(files[0], 'Some title')

    onChange(asset)

    this.setState({
      isLoadingImage: false,
    })
  }

  onUrlChange = async(event: React.ChangeEvent<any>) => {
    this.setState({
      imageUrl: event.target.value
    })
  }

  render() {
    const { value, id, onChange } = this.props
    const { imageUrl, fullModel, isLoadingImage } = this.state

    if (fullModel) {
      const title = get(fullModel, 'fields.title')
      const url = get(fullModel, 'fields.file.url')

      return (
          <div className="ImageField">
            <div className="ImageField-preview">
              <img
              className="ImageField-previewImage"
              alt={title}
              width="128"
              height="auto"
              src={`${url}?w=128`}
              />
            </div>
            <BrowseField
              id={id}
              onChange={this.onFileChange}
              value=""
            />
            {isLoadingImage ? (
              <p>Loading image ... </p>
            ) : null}
            <style jsx>{`
              .ImageField {
                display: inline-flex;
                flex-direction: column;
              }
              .ImageField-preview {
                background: white;
                border-radius: 3px;
                border: 1px solid ${input.border};
                display: inline-block;
                max-height: 140px;
                overflow: hidden;
                padding: 6px;
              }
              .ImageField-preview > img {
                height: 100%;
              }
            `}</style>
          </div>
      )
    }
    return (
      <div>Loading</div>
    )
  }
}

export default ImageField
