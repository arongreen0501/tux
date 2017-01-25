import React, { Component, PropTypes } from 'react'

const connect = fn => (
  InnerComponent => {
    class TuxConnection extends Component {
      static contextTypes = {
        tux: PropTypes.object,
      }

      state = {
        dataProps: {},
      }

      componentDidMount () {
        this.context.tux.adapter.addChangeListener(this.refresh)
        this.refresh()
      }

      refresh = async () => {
        const queryApi = this.context.tux.adapter.getQueryApi()
        const dataProps = await fn(queryApi)
        this.setState({ dataProps })
      }

      render() {
        return <InnerComponent {...this.props} {...this.state.dataProps} refresh={this.refresh} />
      }
    }
    return TuxConnection
  }
)

export default connect
