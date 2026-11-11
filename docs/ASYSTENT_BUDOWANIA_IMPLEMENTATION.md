# ASYSTENT BUDOWANIA — MASTER IMPLEMENTATION BRIEF

## Cel
Przebuduj istniejący projekt z repozytorium `radekkarc1-crypto/mazowieckie-paliwa` w aplikację webową **Asystent Budowania**. To ma być responsywna aplikacja do przeglądania, organizowania i wykonywania instrukcji budowy krok po kroku.

**Ważne rozróżnienie:** podczas prac możesz korzystać z własnych możliwości jako zewnętrzne narzędzie programistyczne, ale GOTOWA APLIKACJA NIE MOŻE zawierać chatbota, modelu AI, wywołań API AI, agentów AI ani funkcji generowania instrukcji przez AI. Instrukcje przygotowuje użytkownik poza aplikacją (np. w ChatGPT), a następnie importuje je do Asystenta Budowania.

## Zasada nadrzędna: najpierw audyt, potem bezpieczna przebudowa
1. Pracuj wyłącznie na gałęzi `asystent-budowania-rebuild`, utworzonej z `main`. Nie commituj do `main`.
2. Na początku przejrzyj całe repozytorium, wszystkie katalogi, endpointy, konfiguracje, zależności, historię i istniejące integracje. Nie zakładaj, że projekt jest zwykłą stroną statyczną.
3. Zachowaj możliwość powrotu do oryginału. Nie usuwaj historii Git, starych plików ani danych. Nie wykonuj destrukcyjnych zmian w istniejącej bazie.
4. Rozpoznaj istniejące integracje i sekrety wyłącznie przez nazwy/obecność zmiennych. Nigdy nie wypisuj, nie loguj, nie kopiuj do dokumentacji ani nie ujawniaj wartości sekretów.
5. Kontynuuj automatycznie przez wszystkie etapy bez proszenia użytkownika o wpisywanie „next”. Pytaj tylko wtedy, gdy bez działania użytkownika nie da się bezpiecznie przejść dalej (np. wymagane logowanie, sekret, płatna operacja, reaktywacja usługi lub nieodwracalna zmiana).
6. Nie zmieniaj domen produkcyjnych, nie publikuj do produkcji, nie nadpisuj produkcyjnego wdrożenia i nie wykonuj migracji na zdalnej bazie bez wyraźnego potwierdzenia użytkownika.

## Kontekst infrastruktury
- GitHub repo: `radekkarc1-crypto/mazowieckie-paliwa`
- Gałąź robocza: `asystent-budowania-rebuild`
- Vercel project: `mazowieckie-paliwa`
- Supabase project ref: `qbhafxnaqyrlrtjtzjhw`
- Wstępny odczyt wskazał, że projekt Supabase ma status **INACTIVE**. Nie próbuj go automatycznie reaktywować, usuwać ani zmieniać planu. Przygotuj aplikację i migracje lokalnie, a integrację zdalną oznacz jako zablokowaną do czasu bezpiecznej autoryzacji/reaktywacji przez właściciela.
- Projekt Vercel ma istniejące wdrożenie i domeny. Nie kieruj ich na nową aplikację bez osobnej zgody.
- Wykryte repo zawiera dotychczasową stronę Mazowieckie Paliwa i zależności serwerowe. Nie zakładaj, że wolno skasować jej działające funkcje bez sprawdzenia zależności. Docelowo repo ma stać się Asystentem Budowania, ale przebudowę wykonaj na gałęzi roboczej.

## Produkt: funkcje aplikacji
### 1. Start / pulpit
- Nazwa i branding: **Asystent Budowania**.
- Nowoczesny, czytelny interfejs po polsku, responsywny na komputerze, tablecie i telefonie.
- Pulpit z listą projektów/instrukcji, ostatnio otwieranymi instrukcjami i postępem.
- Stany: brak projektów, ładowanie, błąd, sukces.
- Nawigacja powinna być prosta i zrozumiała.

### 2. Import instrukcji
- Użytkownik może zaimportować przygotowany wcześniej pakiet instrukcji z pliku JSON; opcjonalnie obsłuż Markdown jako czytelny format tylko wtedy, gdy da się go bezpiecznie i jednoznacznie sparsować.
- Zaimplementuj i udokumentuj jawny, wersjonowany schemat JSON. Preferowany format:
  - `schemaVersion`
  - `project`: `id`, `title`, `description`, `category`, opcjonalne `coverImage`, `estimatedDuration`
  - `parts`: lista elementów/części z `id`, `name`, `quantity`, opcjonalnymi `notes` i `image`
  - `steps`: lista kroków z `id`, `title`, `instructions`, `partsUsed`, opcjonalnymi `image`, `diagram`, `warnings`, `duration`
- Waliduj plik przed importem: wersję schematu, wymagane pola, typy, unikalność ID, referencje części i limity rozmiaru. Błędny plik nie może częściowo uszkodzić danych.
- Pokaż podgląd projektu i liczbę kroków/części przed zatwierdzeniem importu.
- Nie wykonuj żadnego generowania AI po stronie aplikacji. Import jest deterministyczny.

### 3. Czytnik krok po kroku
- Widok instrukcji z nazwą projektu, postępem, aktualnym krokiem, treścią, obrazami/diagramami, używanymi częściami i ostrzeżeniami.
- Przyciski: poprzedni krok, następny krok, oznacz krok jako wykonany, wróć do listy.
- Możliwość skoku do listy kroków i wznowienia od ostatniego miejsca.
- Czytelny wskaźnik postępu (np. 4/18 i pasek).
- Zachowaj wygodę na małych ekranach i duże obszary dotykowe.

### 4. Projekty i postęp
- Użytkownik może przeglądać, otwierać, usuwać własne zaimportowane projekty (z potwierdzeniem) i śledzić postęp.
- Postęp zapisuje się automatycznie i jest przywracany po ponownym otwarciu aplikacji.
- Zadbaj o obsługę konfliktów i błędów sieci. W miarę możliwości lokalny zapis roboczy powinien chronić postęp przy chwilowej utracie połączenia.
- Nie usuwaj projektu tylko dlatego, że import nowej wersji ma ten sam tytuł. Zaproponuj bezpieczne rozróżnienie/aktualizację.

### 5. Konto i dane
- Jeśli istniejąca konfiguracja Supabase pozwala na bezpieczne użycie, przygotuj logowanie/rejestrację i prywatne dane użytkownika.
- Dane użytkownika muszą być odseparowane. Włącz RLS dla każdej tabeli w schemacie wystawionym przez Data API i przygotuj polityki ograniczające rekordy do właściciela.
- Nigdy nie używaj `user_metadata` jako źródła uprawnień. Nie umieszczaj klucza `service_role` ani sekretnego klucza w kodzie klienta. Frontend może używać wyłącznie klucza publishable/anon przeznaczonego do klienta.
- Przygotuj migracje SQL w repozytorium, ale nie uruchamiaj ich na nieaktywnym zdalnym projekcie.
- Jeżeli Supabase jest niedostępny, aplikacja powinna mieć tryb demonstracyjny/lokalny bez utraty możliwości sprawdzenia interfejsu. Jasno oznacz, że synchronizacja konta wymaga aktywnego backendu. Nie udawaj, że zapis do chmury działa.

## Architektura i jakość
1. Ustal framework na podstawie faktycznego repozytorium i wybierz możliwie najmniej ryzykowną modernizację. Nie przepisuj wszystkiego w ciemno.
2. Zachowaj TypeScript, jeśli projekt już go używa; w przeciwnym razie dobierz typowanie rozsądnie.
3. Wydziel komponenty, typy, walidację importu, warstwę danych i obsługę postępu.
4. Dodaj testy jednostkowe walidatora JSON i kluczowych funkcji postępu oraz testy integracyjne/e2e głównych ścieżek, jeśli infrastruktura na to pozwala.
5. Dodaj `README.md` po polsku: uruchomienie lokalne, konfiguracja środowiska, format importu, testy, wdrożenie i ograniczenia.
6. Dodaj przykładowy plik instrukcji JSON, który pozwala przetestować aplikację od razu.
7. Dodaj `.env.example` zawierający wyłącznie nazwy zmiennych i przykładowe niesekretne placeholdery. Nie commituj prawdziwych sekretów.
8. Zależności instaluj z przypiętymi wersjami i aktualizuj lockfile. Nie dodawaj zbędnych usług ani bibliotek.
9. Zapewnij dostępność: semantyczny HTML, obsługa klawiatury, etykiety, kontrast i widoczne stany fokusu.
10. Dodaj obsługę błędów bez ujawniania sekretów ani danych użytkowników.

## Plan wykonania: realizuj wszystkie etapy po kolei bez pytania o „next”
A. Audyt repozytorium i konfiguracji (bez ujawniania wartości sekretów).
B. Opis aktualnej architektury i ryzyk w `docs/audit.md`.
C. Projekt architektury docelowej i schematu danych w `docs/architecture.md`.
D. Implementacja responsywnego interfejsu Asystenta Budowania.
E. Implementacja wersjonowanego formatu JSON, walidacji i importu z podglądem.
F. Implementacja czytnika kroków i zapisu postępu.
G. Implementacja lokalnego trybu demonstracyjnego i przygotowanie integracji Supabase.
H. Migracje SQL oraz RLS jako pliki w repozytorium, bez zdalnego wykonania.
I. Testy, lint, typecheck i build. Naprawiaj znalezione błędy i powtarzaj testy.
J. Aktualizacja README, pliku przykładowego i `.env.example`.
K. Przegląd bezpieczeństwa i sprawdzenie, czy w aplikacji nie ma AI/API AI.
L. Commituj małe, logiczne zmiany na gałęzi roboczej. Nie łącz gałęzi i nie wdrażaj produkcji.
M. Na koniec przedstaw jeden raport: co zrobiono, jakie testy przeszły, co jest zablokowane, jakie zmienne są potrzebne (same nazwy, bez wartości), jak uruchomić projekt i jaki jest następny bezpieczny krok.

## Kryteria akceptacji
- Aplikacja ma nazwę Asystent Budowania i działa lokalnie.
- Można zaimportować przykładowy JSON, zobaczyć podgląd i otworzyć instrukcję.
- Można przechodzić krok po kroku, oznaczać wykonane kroki, zamykać i ponownie otwierać projekt z zachowanym postępem.
- Błędny JSON jest odrzucany z czytelnym komunikatem.
- Interfejs działa na szerokim i wąskim ekranie.
- Testy, lint/typecheck (jeśli skonfigurowane) i build przechodzą albo raport dokładnie wskazuje przeszkodę.
- Nie ma wbudowanego AI, chatbotów ani połączeń do modeli AI.
- Nie ma zmian w produkcyjnej bazie, domenach ani produkcyjnym wdrożeniu.
- Oryginalna gałąź `main` pozostaje nietknięta.

## Zasady komunikacji
Nie pytaj użytkownika o potwierdzenie każdego etapu. Pracuj samodzielnie i raportuj zwięźle. Jeżeli napotkasz blokadę wymagającą sekretu, autoryzacji, reaktywacji Supabase, płatności lub ryzykownej zmiany, zatrzymaj tylko tę czynność, wykonaj wszystkie niezależne bezpieczne prace i na końcu zadaj jedno konkretne pytanie. Nigdy nie proś o wklejenie sekretów do czatu; użytkownik ma je dodać bezpośrednio w bezpiecznym panelu/menedżerze sekretów.
