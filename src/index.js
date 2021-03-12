import { fromEvent, empty } from "rxjs";
import { ajax } from "rxjs/ajax";
import {
  debounceTime,
  pluck,
  distinctUntilChanged,
  switchMap,
  catchError,
  filter,
  map,
} from "rxjs/operators";

import "../assets/css/style.css";

const app = document.getElementById("app");

app.innerHTML += `
<div class="wrapper">
  <h1>Real Time Search Bar</h2>
  <div class="container">
    <input id="search-bar" type="text" placeholder="eg. Big" aria-label="eg. Big" autofocus>
    <div id="results"></div>
    </div>
</div>
`;

const BASE_URL = "https://api.openbrewerydb.org/breweries";

// elements
const searchEl = document.getElementById("search-bar");
const resultsEl = document.getElementById("results");

// streams
const input$ = fromEvent(searchEl, "input");

input$
  .pipe(
    pluck("target", "value"),
    filter((searchValue) => searchValue.length > 2),
    debounceTime(500),
    distinctUntilChanged(),
    switchMap((searchTerm) =>
      ajax.getJSON(`${BASE_URL}?by_name=${searchTerm}`).pipe(
        map((response) => {
          // map over response to create a unique key
          return { data: response, key: Date.now() };
        }),
        catchError((error, caught) => {
          console.error(`Error: ${error}. Caught ${caught}`);
          return empty();
        })
      )
    )
  )
  .pipe(distinctUntilChanged((pre, curr) => pre.key === curr.key))
  .subscribe((response) => {
    // update DOM
    resultsEl.innerHTML = response.data.map((b) => b.name).join("<br>");
  });
