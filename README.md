# Asystent Budowania

Responsywna aplikacja do importowania i czytania instrukcji budowy krok po kroku.

## Funkcje
- Import pakietów JSON i walidacja struktury
- Biblioteka projektów
- Czytnik instrukcji krok po kroku
- Oznaczanie wykonanych kroków i zapisywanie postępu
- Eksport kopii danych
- Przykładowy pakiet instrukcji

## Uruchomienie
Uruchom `npm start` albo otwórz `index.html` w przeglądarce. Projekt jest statycznym interfejsem bez wbudowanego chatbota, modelu AI ani zewnętrznych API AI.

## Format JSON
Pakiet zawiera `title`, opcjonalne `category`, `description`, listę `parts` oraz tablicę `steps`. Każdy krok zawiera `title`, `description` i opcjonalne `parts`.

## Przechowywanie danych
W tej wersji postępy są zapisywane lokalnie w przeglądarce. Synchronizacja konta wymaga osobnej konfiguracji backendu i aktywnego projektu Supabase.
