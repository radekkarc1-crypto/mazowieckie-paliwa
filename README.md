# Asystent Budowania

Responsywna, instalowalna aplikacja do importowania i czytania instrukcji budowy krok po kroku. Aplikacja nie zawiera chatbota, modeli AI ani wywołań API AI.

## Funkcje
- Biblioteka projektów z podglądem postępu
- Import instrukcji JSON z walidacją podstawowych pól
- Czytnik krok po kroku, szybkie przechodzenie do dowolnego kroku
- Oznaczanie wykonanych kroków i automatyczny zapis lokalny
- Opcjonalne ilustracje HTTPS, ostrzeżenia, czas, pozycja i obrót w krokach
- Eksport kopii wszystkich projektów oraz import/przywracanie kopii
- Przykładowa instrukcja i schemat JSON
- Manifest PWA, ikona, instalacja na obsługiwanych urządzeniach i cache offline

## Uruchomienie
Uruchom `npm start` albo otwórz `index.html` w przeglądarce. Do instalacji PWA i service workera wymagany jest HTTPS lub localhost.

## Format pakietu
Zobacz `public/instruction.schema.json` oraz `public/przykladowa-instrukcja.json`. Każdy pakiet ma `version: 1`, `title` i co najmniej jeden krok. Kroki mogą zawierać `description`, `parts`, ilustrację HTTPS, `warning`, `duration`, `position` i `rotation`.

## Testy
`npm test` uruchamia testy smoke na wbudowanym runnerze Node.js. GitHub Actions uruchamia je przy pushu i pull requeście do gałęzi projektu.

## Przechowywanie danych
Wersja bieżąca zapisuje dane lokalnie w przeglądarce. Eksport kopii pozwala przenieść je ręcznie na inne urządzenie. Synchronizacja konta wymaga aktywnego projektu Supabase i osobnej konfiguracji. Żadna tabela ani dane w istniejącym projekcie Supabase nie zostały zmienione.
