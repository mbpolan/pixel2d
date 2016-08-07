import {provideRouter, RouterConfig} from "@angular/router";
import {WorldEditorComponent} from "./world-editor/world-editor.component";

// configure the top-level routes in our application
export const routes: RouterConfig = [{
  path: 'world',
  component: WorldEditorComponent
}, {
  path: '',
  redirectTo: '/world',
  pathMatch: 'full'
}];
