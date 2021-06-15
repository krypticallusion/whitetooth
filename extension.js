const { St } = imports.gi;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const BluetoothMenu = Main.panel.statusArea.aggregateMenu._bluetooth._item.menu;
const BluetoothMenuBox = BluetoothMenu.box;

let panelButtonText = new PopupMenu.PopupMenuItem(isBluetoothOn() ? "Turn on" : "Turn off");
let originalWidget = BluetoothMenuBox.first_child;

function init() {}

function spawn(command, callback) {
  let [status, pid] = GLib.spawn_async(
    null,
    ["/usr/bin/env", "bash", "-c", command],
    null,
    GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
    null
  );

  if (callback) GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, callback);
}

function isBluetoothOn() {
  return !(BluetoothMenu.focusActor.label.get_text() === "Bluetooth Off");
}

function enable() {
  BluetoothMenuBox.replace_child(originalWidget, panelButtonText);
  panelButtonText.connect("activate", function (w) {
    const isBtOn = isBluetoothOn();

    w.label.set_text(isBtOn ? "Turn on" : "Turn off");

    if (isBtOn) {
      spawn("bluetoothctl power off");
    } else {
      spawn("bluetoothctl power on");
    }

    // BluetoothMenu.focusActor.label.get_text() returns the previous state before the toggle.
    // Since BT is off, get_text() would show Bluetooth Off, but (adapter !==  null) so Bt would power on.
    // Hence the label name should turn to Turn off.
  });
}

function disable(params) {
  BluetoothMenuBox.replace_child(panelButtonText, originalWidget);
}
