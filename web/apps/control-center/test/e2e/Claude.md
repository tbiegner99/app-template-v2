# rules

- any interactable element should have a data-id. this data-id should be used where possible to select the element. Note that this may not uniquely identify an element on the page in which case other selectors may need to be used.
- actions in test should not use playwright apis directly. we want to build out a library of abstract helpers. this is so that for instance selecting an option in a dropdown, which may have multiple actions in it becomes a single logical action.
- helpers should be a class and take the page or other fixtures as contructor objects as necessary
- suites should be named of the form xx-test-name.ts where xx is a 2 digit number which is the order of the suite, i.e 01.
- suites should be grouped according to application section/function and the containing folder should be of the form xx-function
