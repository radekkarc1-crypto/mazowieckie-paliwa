# Asystent Budowania

Responsywna, instalowalna aplikacja PWA do importowania i czytania instrukcji budowy krok po kroku. Pakiety instrukcji przygotowujesz poza aplikacją, a aplikacja prowadzi przez kolejne kroki i zapisuje postęp. Nie ma wbudowanego chatbota ani wywołań API modeli AI.

## Funkcje
- Biblioteka projektów z wyszukiwaniem i filtrowaniem postępu
- Import instrukcji JSON (do 5 MB, maks. 500 kroków) z walidacją
- Czytnik krok po kroku, skoki do wybranego kroku i oznaczanie wykonania
- Ilustracje HTTPS, ostrzeżenia, czas, pozycja, obrót i części przypisane do kroku
- Automatyczny zapis lokalny, eksport i przywracanie kopii
- Opcjonalne konto e-mail i synchronizacja projektów przez Supabase
- Manifest PWA, instalacja na obsługiwanych urządzeniach i cache offline
- Lokalny serwer deweloperski bez dodatkowych zależności

## Uruchomienie lokalne
Wymagany Node.js 18 lub nowszy.

```bash
npm start
```

Otwórz `http://localhost:3000`. Dla lokalnej synchronizacji ustaw zmienne środowiskowe `SUPABASE_URL` i `SUPABASE_ANON_KEY` przed uruchomieniem serwera.

## Supabase
1. Aktywuj projekt Supabase.
2. Wykonaj migrację `supabase/migrations/20261111000000_user_backups.sql`.
3. Ustaw w środowisku Vercel zmienne `SUPABASE_URL` i `SUPABASE_ANON_KEY`.
4. Włącz potwierdzanie adresu e-mail w ustawieniach Auth, jeśli ma być wymagane.

Endpoint `/api/config.js` udostępnia wyłącznie publiczny URL i klucz anon. Nigdy nie umieszczaj klucza `service_role` w aplikacji ani w zmiennych dostępnych dla przeglądarki. Tabela ma włączone RLS i użytkownik może odczytywać oraz modyfikować wyłącznie własną kopię.

Jeśli konfiguracja Supabase nie jest dostępna, aplikacja działa w trybie lokalnym. Dane lokalne nie są kasowane po wylogowaniu.

## Format pakietu
Zobacz `public/instruction.schema.json` oraz `public/przykladowa-instrukcja.json`. Pakiet wymaga `version: 1`, `title` i co najmniej jednego kroku. Kroki mogą zawierać `description` (lub `instruction`), `parts`, ilustrację HTTPS, `warning`, `duration`, `position` i `rotation`.

## Testy
`npm test` uruchamia testy smoke na wbudowanym runnerze Node.js. GitHub Actions uruchamia je przy pushu i pull requeście do gałęzi `asystent-budowania-rebuild`.
