import type { Command} from 'vscode'
import { Uri } from 'vscode'
import type { IProblem, ProblemState } from '../tomjs/ttenum'

export class TomHubNode {

  constructor(private data: IProblem) { }

  public get isUrl(): boolean {
    return this.data.isUrl
  }

  public get IsCmd(): boolean {
    return this.data.isCmd
  }

  public get name(): string {
    return this.data.name
  }

  public get state(): ProblemState {
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
      command: 'tt.previewUrls',
      arguments: [this]
    }
  }

  public get uri(): Uri {
    return Uri.from({
      scheme: 'tomHubTools',
      authority: this.isUrl ? 'urls' : 'tree-node',
      path: `/${this.id}`, // path must begin with slash /
      query: `url=${this.url}&type=${this.type}`
    })
  }

}
