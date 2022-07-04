import { URLSearchParams } from 'url'
import type {
  FileDecoration,
  FileDecorationProvider,
  ProviderResult,
  Uri
} from 'vscode'
import { ThemeColor } from 'vscode'

export class UrlsDecorationProvider implements FileDecorationProvider {
  private readonly DIFFICULTY_BADGE_LABEL: { [key: string]: string } = {
    Documents: 'Documents',
    Tools: 'Tools',
    Videos: 'Videos'
  }

  private readonly ITEM_COLOR: { [key: string]: ThemeColor } = {
    Documents : new ThemeColor('charts.green'),
    Tools: new ThemeColor('charts.yellow'),
    Videos: new ThemeColor('charts.red')
  }

  public provideFileDecoration(uri: Uri): ProviderResult<FileDecoration>  {
    // 判断是否开启文件夹颜色区分
    // if (!this.isDifficultyBadgeEnabled()) {
    //   return
    // }

    if (uri.scheme !== 'tomHubTools' && uri.authority !== 'urls') {
      return
    }

    const params: URLSearchParams = new URLSearchParams(uri.query)
    const type: string = params.get('type')!.toLowerCase()
    return {
      badge: this.DIFFICULTY_BADGE_LABEL[type],
      color: this.ITEM_COLOR[type]
    }
  }

  // private isDifficultyBadgeEnabled(): boolean {
  //   const configuration: WorkspaceConfiguration = 
  //     workspace.getConfiguration()
  //   return configuration.get<boolean>('tt.colorOverride', false)
  // }
}

export const THDecorationProvider: UrlsDecorationProvider =
  new UrlsDecorationProvider()
