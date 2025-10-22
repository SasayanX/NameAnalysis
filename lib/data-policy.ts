/**
 * データポリシー
 *
 * このアプリケーションでは、以下のデータポリシーを厳守します：
 *
 * 1. 画数データや画数吉凶データを勝手に生成しない
 * 2. ウェブから情報をコピーしない
 * 3. ユーザーの指示またはエディタで編集されたデータのみを元データとして保持する
 *
 * このポリシーは、データの整合性と信頼性を確保するために設けられています。
 * データの変更や追加は、必ずユーザーの明示的な指示または承認を得た上で行ってください。
 */

export const DATA_POLICY = {
  AUTO_GENERATION_PROHIBITED: true,
  WEB_SCRAPING_PROHIBITED: true,
  USER_APPROVAL_REQUIRED: true,
}

/**
 * データソースの種類
 */
export enum DataSource {
  USER_PROVIDED = "user_provided",
  EDITOR_EDITED = "editor_edited",
  DEFAULT = "default",
}

/**
 * データの出所を記録するための関数
 * @param data 対象データ
 * @param source データの出所
 * @returns データソース情報を含むデータ
 */
export function tagDataSource<T>(data: T, source: DataSource): T & { _source: DataSource } {
  return {
    ...data,
    _source: source,
  }
}

/**
 * データの出所を確認する関数
 * @param data 対象データ
 * @returns データの出所
 */
export function getDataSource<T>(data: T & { _source?: DataSource }): DataSource {
  return data._source || DataSource.DEFAULT
}

/**
 * ユーザー承認済みのデータかどうかを確認する関数
 * @param data 対象データ
 * @returns ユーザー承認済みの場合はtrue
 */
export function isUserApproved<T>(data: T & { _source?: DataSource }): boolean {
  const source = getDataSource(data)
  return source === DataSource.USER_PROVIDED || source === DataSource.EDITOR_EDITED
}
