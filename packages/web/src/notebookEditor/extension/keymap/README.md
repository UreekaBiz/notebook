Keymap allows to bind custom keybinding to commands in the Editor.
Ideally, each extension should provide its own keybindings, and Keymap is only used
when a general keybinding is needed (e.g. CMD + Shift + Enter to run a cell) or to
overwrite a default keybinding.

Since keymap has a bigger scope than other extensions, it is not a good idea to
bind keys that can be used by multiple extensions since this can lead to conflicts.