# Architecture

- src/domains will contain business logic including fetching data from external sources. each domain should contain a service, datasource and mapper file. an axample would be inspections domain which would be located in src/domains/inspections and contain files service.ts,datasource.ts and mapper.ts. subdomains may also be used as necessary and get their own folder, such as src/domains/inspections/equipment
- any server interactions should be done in a data layer. these datasource objects should have a corresponding mapper object that maps server object to local business models the mapper file and
- axios library should be used for api interactions
- each page that requires data should be composed of 2 things: a controller and a view. A controller is not needed for all views, but should handled a few things. 1. it should handle fetching and saving data 2. it should handle navigation and fetching state from the url. 3. it should handle accessing any global state (for example from redux) 4. it should handle accessing and passing context. The controller MAY also manage loding state and may render appropriate loading indicators while necessary data is loading.this is to ensure that the view is easily testable without having to worry about mocking. However, the view can still manage its own internal state. An example would be HomeController.tsx and Home.tsx
- use the LoadingState object (src/components/loadingState) to manage loading state and errors from apis

# Error handling

- TO BE DETERMINED

## other rules

- any component that requires a certain user role to see should be wrapped in a RequireRoles object
- prefer to use layout components such as src/components/layou/Page,Grid,FlexRow and FlexColumn instead of adding redundant css.
- prefer to use css modules over inline styles except where impossible. css files should be located in the same folder as its consumer and should only contain styles used by that component or page.

- use components from ../apps/components as much as possible to centralize theming
- use component composition to form new components as much as possible. when the new component is generic and may be used outside of control center project, it should go in the ../apps/components project in an appropriate place. When it may be used accross multiple pages within control center, it should be placed in the src/components folder. when it is specific to a page it should be within the page folder
- each file should be limited to less than 500 lines where possible
- all user visible text should be translated by either using <TranslatedText/> component from components (in the case of text inside of headers for example). for things like placeholders that would be inside of an attribute of html, use the dictionary from the useI18n hook from components. all text should have a key entry inside of src/i18n/translations.json. keys should be heirarchical string separated by a dot, i.e. "controlCenter.inspections.cabinet.title" that uniquely identify the text in the application. however common text may be used for commmon text. when this happens use "controlCenter.common" as a prefix of the key. an example could be for a cancel button text.
- all text that is not placeholders should be inside of one of the typography elements in components. note that translated text can be a child of these typography components
- make sure all interactable elements have a data-id prop that should mostly uniquely identify it. other identifiable props may be used such as data-role. these will be used when interacting with the elements during e2e tests.
- all features should have an e2e test in playwright. these should be in the tests/e2e folder. tests should be tagged as @granular if the test is testing an edge case and @basic if it is a core happy or sad path. This is done to run only necessary tests on ci to save time
