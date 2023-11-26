import {TabStatus} from './status';

interface ITab {
  id: number,
  active: boolean,
  index?: number,
  selected?: boolean,
  status?: TabStatus,
  title?: string,
  url?: string

  getUrl(): string
}

export default ITab;