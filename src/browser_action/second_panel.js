import {
  add_panel,
  add_panel_event,
  change_active_panel,
  SLIDE_FROM_LEFT,
} from "./panel.js";

function go_back() {
  change_active_panel("main_panel", SLIDE_FROM_LEFT);
}

add_panel("second_panel");
add_panel_event("second_panel", "back", "click", go_back);
