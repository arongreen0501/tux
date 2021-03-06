import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { get } from '../../utils/accessors'
import { input } from '../../theme'
import Spinner from '../Spinner'
import BrowseField from './BrowseField'

export interface ImageFieldProps {
  field: string | Array<string>,
  id: string,
  name: string,
  onChange: Function,
  value: any,
}


class ImageField extends React.Component<ImageFieldProps, any> {
  static contextTypes = {
    tux: PropTypes.object,
  }

  constructor(props: ImageFieldProps) {
    super(props)

    this.state = {
      fullModel: null,
      isLoadingImage: false,
    }
  }

  async componentDidMount() {
    const { value } = this.props

    let fullModel = null
    if (value instanceof Object) {
      fullModel = await this.context.tux.adapter.loadAsset(value)
    } else {
      fullModel = this.context.tux.adapter.createAsset(value)
    }

    this.setState({
      fullModel
    })
  }

  async componentWillReceiveProps(props: ImageFieldProps) {
    if (!props.value) {
      return
    }

    if (props.value !== this.props.value) {
      const fullModel = await this.context.tux.adapter.loadAsset(props.value)

      this.setState({
        fullModel,
        isLoadingImage: false,
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
  }

  render() {
    const { value, id, onChange } = this.props
    const { fullModel, isLoadingImage } = this.state

    if (fullModel) {
      const title = get(fullModel, 'fields.title')
      const url = get(fullModel, 'fields.file.url')

      return (
          <div className="ImageField">
            {isLoadingImage ? (
              <div className="ImageField-preview">
                <Spinner />
              </div>
            ) : url ? (
              <div className="ImageField-preview">
                <img
                className="ImageField-previewImage"
                alt={title}
                width="128"
                height="auto"
                src={`${url}?w=128`}
                />
              </div>
            ) : null}
            <BrowseField
              id={id}
              onChange={this.onFileChange}
              value=""
            />
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
                height: 140px;
                overflow: hidden;
                padding: 6px;
                position: relative;
                width: 140px;
              }
              .ImageField-preview > img {
                height: 100%;
                object-fit: contain;
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
