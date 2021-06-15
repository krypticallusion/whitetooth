const { St } = imports.gi;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GnomeBluetooth = imports.gi.GnomeBluetooth;
const GLib = imports.gi.GLib;
const BluetoothMenu = Main.panel.statusArea.aggregateMenu._bluetooth._item.menu;
const BluetoothMenuBox = BluetoothMenu.box;

let panelButtonText = new PopupMenu.PopupMenuItem(BluetoothMenu.focusActor.label.get_text() === "Bluetooth On" ? "Turn on" : "Turn off");
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

function _getDefaultAdapter() {
    const client = new GnomeBluetooth.Client();
    const model = client.get_model();

    let [ret, iter] = model.get_iter_first();
    while (ret) {
        let isDefault = model.get_value(iter,
                                              GnomeBluetooth.Column.DEFAULT);
        let isPowered = model.get_value(iter,
                                              GnomeBluetooth.Column.POWERED);
        if (isDefault && isPowered)
            return iter;
        ret = model.iter_next(iter);
    }
    return null;
}

function enable() {
  BluetoothMenuBox.replace_child(originalWidget, panelButtonText);
  panelButtonText.connect("activate", function (w) {
    const adapter = _getDefaultAdapter();
  
    if (adapter === null) {
        spawn("bluetoothctl power off");
    } else {
        spawn("bluetoothctl power on")
    }

    // BluetoothMenu.focusActor.label.get_text() returns the previous state before the toggle.
    // Since BT is off, get_text() would show Bluetooth Off, but (adapter !==  null) so Bt would power on.
    // Hence the label name should turn to Turn off. 
    w.label.set_text(BluetoothMenu.focusActor.label.get_text() === "Bluetooth Off" ? "Turn off" : "Turn on")
    
  });
}

function disable(params) {
  BluetoothMenuBox.replace_child(panelButtonText, originalWidget);
}
