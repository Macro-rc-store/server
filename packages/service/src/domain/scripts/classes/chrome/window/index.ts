import { SERVER_CLASS } from "../../../codes";
import Script from "../../../script";
import ScriptStore from "../../../store";

class ChromeWindow {
  open(createData?: chrome.windows.CreateData): Promise<chrome.windows.Window | undefined> {
    return new Promise((resolve) => {
      chrome.windows.create(createData || {}, resolve);
    });
  }

  close(windowId: number) {
    return new Promise((resolve) => {
      chrome.windows.remove(windowId, resolve);
    });
  }

  getAll(): Promise<Array<chrome.windows.Window>> {
    return new Promise((resolve) => {
      chrome.windows.getAll(resolve);
    });
  }

  async closeAll() {
    const windows = await this.getAll();
    await Promise.all(windows.map(window => this.close(window.id as number)));
  }
}

ScriptStore.getInstance().addScript(
  new Script({
    code: SERVER_CLASS.CHROME.WINDOW,
    content: ChromeWindow,
    name: 'ChromeWindow class'
  })
);

export default ChromeWindow;