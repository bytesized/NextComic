import {
  add_panel,
  add_panel_event,
  change_active_panel,
  remove_panel_event,
  SLIDE_FROM_LEFT,
  SLIDE_FROM_RIGHT
} from "./panel.js"

function go_forward() {
  change_active_panel("second_panel", SLIDE_FROM_RIGHT);
}

add_panel("main_panel", {initial_panel: true});
add_panel_event("main_panel", "forward", "click", go_forward);
