import {fromEvent, of} from 'rxjs';
import {ajax} from 'rxjs/internal-compatibility';
import {catchError, debounceTime, map, switchMap} from 'rxjs/operators';

const API_KEY: string = '12336989-2163ffb915c29e08a1d669169';
const DEBOUNCE_TIME = 400;

// Types for response
type hit = {
    previewURL: string,
    largeImageURL: string,
};
type searchResult = {
    totalHits: number,
    hits: hit[],
};

document.addEventListener('DOMContentLoaded', () => {
    // Elem refs
    const searchInput = document.querySelector('.search');
    const resultsContainer = document.querySelector('.results-container') as HTMLDivElement;

    // Observables
    const input$ = fromEvent(searchInput as HTMLInputElement, 'input');
    const values$ = input$.pipe(
        map((e) => {
            const event: InputEvent = e as InputEvent;
            const target: HTMLInputElement = event.target as HTMLInputElement;
            return target.value ? buildURL(target.value) : '';
        }),
    );

    const search$ = values$.pipe(
        debounceTime(DEBOUNCE_TIME),
        switchMap(request),
    );

    search$.subscribe((data) => {
        clear(resultsContainer);
        if (data) {
            mountSearchResults(resultsContainer, data as searchResult);
        }
    });

    function request(url: string) {
        return ajax.getJSON(url).pipe(
            catchError((err) => {
                console.log(err);
                return of();
            }),
        );
    }
});

function mountSearchResults(container: HTMLDivElement, results: searchResult): void {
    results.hits.forEach((searchHit: hit) => {
        const image = createImage(searchHit.previewURL);
        container.appendChild(image);
    });
}

function createImage(url: string) {
    const image = document.createElement('img');
    image.src = url;
    return image;
}

function clear(element: HTMLElement): void {
    element.innerHTML = '';
}

function buildURL(query: string): string {
    return `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(query)}`;
}
