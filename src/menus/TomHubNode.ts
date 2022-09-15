import type { Command } from 'vscode'
import { Uri } from 'vscode'
import type { IUrl, UrlState } from '../common/models'
import { explorer, keyCommands } from '../common/ttenum'

export class TomHubNode {
  constructor(private data: IUrl) {}

  public get isUrl(): boolean {
    return this.data.isUrl
  }

  public get isCmd(): boolean {
    return this.data.isCmd
  }

  public get name(): string {
    return this.data.name
  }

  public get state(): UrlState {
    return this.data.state
  }

  public get id(): string {
    return this.data.id
  }

  public get url(): string {
    return this.data.url
  }

  public get type(): string {
    return this.data.type
  }

  public get tags(): string[] {
    return this.data.tags
  }

  public get handleCommand(): Command {
    return {
      title: 'Handle Command',
      command: this.data.url,
      arguments: [this]
    }
  }

  public get previewCommand(): Command {
    return {
      title: 'Preview Url',
      command: keyCommands.preview,
      arguments: [this]
    }
  }

  public get uri(): Uri {
    return Uri.from({
      scheme: explorer,
      authority: this.isUrl ? 'urls' : 'tree-node',
      path: `/${this.id}`,
      query: `url=${this.url}&type=${this.type}`
    })
  }
}
