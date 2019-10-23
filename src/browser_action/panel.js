/*************************************************************************************************
 * panel.js
 *
 * This is the module that controls the panel display in the popup. A panel is a `body > div` that
 * describes an entire popup view. That is to say, only one panel is displayed at a time, and it
 * will take up the entire popup. Panels will be animated into view with a short sliding transition
 * from the right or left, which are intended to give an indication of moving into and out of
 * menus, help pages, etc.
 *
 * A panel should be registered using: `add_panel("panel_id", options)`. See the definition of
 * `add_panel` for details. This must be done prior to any other interaction with the panel.
 *
 * Event listeners should be connected separately from the panel's constructor. This mechanism
 * allows events to be disconnected immediately when the slide transition starts, unlike the
 * destructor, which runs when the slide transition ends. This prevents the old panel from
 * receiving events while the new one is being swapped in.
 *
 * The mechanism for adding event listeners is:
 * `add_panel_event("panel_id", "target_id", "event_name", callback_fn)`.
 * This will end up translating to something like:
 * `document.getElementById("target_id").addEventListener("event_name", callback_fn)`
 * If this is called on the active panel, the event will be connected immediately. Events can be
 * disconnected with `remove_panel_event`, which takes the same arguments.
 *
 * The currently active panel can be changed with `change_active_panel("panel_id", direction)`.
 * The direction should be one of `SLIDE_FROM_LEFT` or `SLIDE_FROM_RIGHT`.
 *************************************************************************************************/

/*************************************************************************************************
 * Globals
 *************************************************************************************************/
// Directions to pass as the second argument to `change_active_panel`
const SLIDE_FROM_LEFT                                         = 0;
const SLIDE_FROM_RIGHT                                        = 1;

// Panel definitions.
// Entry format:
//   "the panel's id": {
//     event_listeners: [
//        {
//          target_id: "The id of the EventTarget to listen to",
//          event: "The event to listen for. This will be passed as the first argument to " +
//                 "EventTarget.addEventListener()",
//          fn: "The function to execute"
//        }
//     ],
//     constructor: "Function needed to initialize the panel",
//     destructor: "Function to clean up the panel"
//   }
let PANEL = {};

// Class names used to apply CSS styles
const ACTIVE_PANEL_CLASS                                      = "active";
const NEW_ACTIVE_PANEL_CLASS                                  = "new_active";

// Panel slide animation definitions
const SLIDE_FROM_LEFT_KEYFRAMES = [
  { transform: "translateX(-100%)" },
  { transform: "translateX(0)" }
];
const SLIDE_FROM_RIGHT_KEYFRAMES = [
  { transform: "translateX(100%)" },
  { transform: "translateX(0)" }
];
const SLIDE_DURATION_MS                                       = 180;

/*************************************************************************************************
 * Helper functions
 *************************************************************************************************/
function get_active_panel() {
  return document.querySelector("body > div." + ACTIVE_PANEL_CLASS);
}

function panel_is_active(panel_id) {
  let active_panel = get_active_panel(panel_id);
  if (!active_panel) {
    return false;
  }
  return active_panel.id == panel_id;
}

// Adds the panel's event listeners, as described in `PANEL`.
function add_event_listeners(panel_id) {
  for (let event_listener of PANEL[panel_id].event_listeners) {
    let el = document.getElementById(event_listener.target_id);
    if (el) {
      el.addEventListener(event_listener.event, event_listener.fn);
    }
  }
}

// Removes the panel's event listeners that were set with `add_event_listeners`.
function remove_event_listeners(panel_id) {
  for (let event_listener of PANEL[panel_id].event_listeners) {
    let el = document.getElementById(event_listener.target_id);
    if (el) {
      el.removeEventListener(event_listener.event, event_listener.fn);
    }
  }
}

function construct_panel(panel_id) {
  let constructor = PANEL[panel_id].constructor;
  if (constructor) {
    constructor();
  }
}

function destruct_panel(panel_id) {
  let destructor = PANEL[panel_id].destructor;
  if (destructor) {
    destructor();
  }
}

/*************************************************************************************************
 * Primary Panel Functionality
 *************************************************************************************************/
// This function adds a panel, allowing it to be displayed. This function must be called prior to
// and other interaction with the panel.
// These are the available options:
//   constructor          If specified, should be a function that will be run whenever the panel is
//                        displayed.
//   destructor           If specified, should be a function that will be run after the panel is
//                        hidden by another panel becoming active.
//   initial_panel        If specified, should be a boolean indicating whether this is the panel
//                        to be shown when the popup loads. Only one panel should be set as the
//                        initial panel.
function add_panel(panel_id, options = null) {
  if (!options) {
    options = {};
  }
  PANEL[panel_id] = {
    constructor: options.constructor ? options.constructor : null,
    destructor: options.destructor ? options.destructor : null,
    event_listeners: [],
  };

  if (options.initial_panel) {
    if (options.constructor) {
      options.constructor();
    }

    let panel = document.getElementById(panel_id);
    panel.classList.add(ACTIVE_PANEL_CLASS);

    // Normally we would connect event listeners at this point, but we just set it to be an empty
    // list.
  }
}

function add_panel_event(panel_id, target_id, event, fn) {
  PANEL[panel_id].event_listeners.push({
    target_id,
    event,
    fn,
  });

  if (panel_is_active(panel_id)) {
    let el = document.getElementById(target_id);
    if (el) {
      el.addEventListener(event, fn);
    }
  }
}

function remove_panel_event(panel_id, target_id, event, fn) {
  let event_listener_index = PANEL[panel_id].event_listeners.findIndex((listener) => {
    return listener.target_id == target_id && listener.event == event && listener.fn === fn;
  });
  if (event_listener_index == -1) {
    return;
  }
  PANEL[panel_id].event_listeners.splice(event_listener_index, 1);

  if (panel_is_active(panel_id)) {
    let el = document.getElementById(target_id);
    if (el) {
      el.removeEventListener(event, fn);
    }
  }
}

// Switches the panel view from the current active panel to the one specified by `panel_id`.
// `direction` determines whether the transition animation slides the new panel in from the left
// or right. It should be either `SLIDE_FROM_LEFT` or `SLIDE_FROM_RIGHT`.
function change_active_panel(panel_id, direction) {
  let new_panel = document.getElementById(panel_id);
  let old_panel = get_active_panel();
  if (old_panel === new_panel) {
    return;
  }

  remove_event_listeners(old_panel.id);
  construct_panel(new_panel.id);

  new_panel.classList.add(NEW_ACTIVE_PANEL_CLASS);
  new_panel.classList.add(ACTIVE_PANEL_CLASS);

  let keyframes = direction == SLIDE_FROM_LEFT ? SLIDE_FROM_LEFT_KEYFRAMES
                                               : SLIDE_FROM_RIGHT_KEYFRAMES;
  let animation = new_panel.animate(keyframes, {duration: SLIDE_DURATION_MS});
  animation.onfinish = () => {
    add_event_listeners(new_panel.id);
    old_panel.classList.remove(ACTIVE_PANEL_CLASS);
    new_panel.classList.remove(NEW_ACTIVE_PANEL_CLASS);
    destruct_panel(old_panel.id);
  };
}

/*************************************************************************************************
 * Exports
 *************************************************************************************************/
export {
  add_panel,
  add_panel_event,
  change_active_panel,
  remove_panel_event,
  SLIDE_FROM_LEFT,
  SLIDE_FROM_RIGHT
};
