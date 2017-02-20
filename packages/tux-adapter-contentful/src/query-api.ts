import axios from 'axios'
import { AxiosInstance } from 'axios';

class QueryApi {
  private overrides : {
    [id : string] : any,
  }
  private client : AxiosInstance

  constructor(space : string, accessToken : string, subDomain : string) {
    this.overrides = {}
    this.client = axios.create({
      baseURL: `https://${subDomain}.contentful.com/spaces/${space}`,
      headers: {
        'authorization': `Bearer ${accessToken}`,
      },
    })
  }

  async getEntries(params? : Object) {
    const result = await this.client.get('/entries', { params }).then(result => result.data)
    result.items = result.items.map(this.checkOverride)
    this.linkIncluded(result)
    return result
  }

  async getEntry(id : string) {
    const entry = await this.client.get(`/entries/${id}`).then(result => result.data)
    return this.checkOverride(entry)
  }

  override(entry : any) {
    this.overrides[entry.sys.id] = entry
  }

  populateLinks(links, linkMap) {
    for (const asset of links) {
      if (asset.sys) {
        linkMap[asset.sys.id] = this.checkOverride(asset).fields
      }
    }
  }

  linkIncluded(result) {
    const linkMap = {}

    // Find included models
    for (const entryType in result.includes) {
      this.populateLinks(result.includes[entryType], linkMap)
    }

    // Add included models to items
    for (const item of result.items) {
      const fieldNames = Object.keys(item.fields)
      for (const fieldName of fieldNames) {
        const field = item.fields[fieldName]
        if (field instanceof Array) {
          for (const childField of field) {
            if (childField.sys && childField.sys.type === 'Link') {
              childField.text = linkMap[childField.sys.id].text
            }
          }
        } else if (field.sys && field.sys.type === 'Link') {
          field.fields = linkMap[field.sys.id]
        }
      }
    }
  }

  checkOverride = (entry : any) => {
    const other = this.overrides[entry.sys.id]
    if (other && other.sys.updatedAt > entry.sys.updatedAt) {
      return other
    } else {
      return entry
    }
  }
}

export default QueryApi
