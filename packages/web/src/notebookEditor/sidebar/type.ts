// ********************************************************************************
export enum SidebarPanel {
  Toolbar = 'toolbar',
  Outline = 'outline',
}

const ReadableSidebarPanel: Record<SidebarPanel, string> = {
  [SidebarPanel.Toolbar]: 'Toolbar',
  [SidebarPanel.Outline]: 'Outline',
};
export const getReadableSidebarPanel = (panel: SidebarPanel) => ReadableSidebarPanel[panel];
