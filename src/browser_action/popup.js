// Directions to pass as the second argument to `change_active_panel`
const SLIDE_FROM_LEFT                                         = "from_left";
const SLIDE_FROM_RIGHT                                        = "from_right";

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
const PANEL = {
  main_panel: {
    event_listeners: [
    ],
  }
}

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
const SLIDE_DURATION_MS = 180;

/*************************************************************************************************
 * Panels                                                                                        *
 *************************************************************************************************/
function get_active_panel() {
  return document.querySelector("body > div.active");
}

// Adds the panel's event listeners, as described in `PANEL`.
function add_event_listeners(panel_id) {
  let event_listeners = PANEL[panel_id].event_listeners;
  if (event_listeners) {
    for (let event_listener of event_listeners) {
      let el = document.getElementById(event_listener.target_id);
      if (el) {
        el.addEventListener(event_listener.event, event_listener.fn);
      }
    }
  }
}

// Removes the panel's event listeners that were set with `add_event_listeners`.
function remove_event_listeners(panel_id) {
  let event_listeners = PANEL[panel_id].event_listeners;
  if (event_listeners) {
    for (let event_listener of event_listeners) {
      let el = document.getElementById(event_listener.target_id);
      if (el) {
        el.removeEventListener(event_listener.event, event_listener.fn);
      }
    }
  }
}

// Connects the active panel's events to init the popup.
function popup_init() {
  let active_panel = get_active_panel();
  if (active_panel) {
    add_event_listeners(active_panel.id);
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

// Switches the panel view from the current active panel to the one specified by `panel_id`.
// `direction` determines whether the transition animation slides the new panel in from the left
// or right. It should be either `SLIDE_FROM_LEFT` or `SLIDE_FROM_RIGHT`.
function change_active_panel(panel_id, direction) {
  let new_panel = document.getElementById(panel_id);
  let old_panel = get_active_panel();
  if (old_panel.id == new_panel.id) {
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
 * Init                                                                                          *
 *************************************************************************************************/
popup_init();
