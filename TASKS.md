# Case Study
You're joining a team tasked with enhancing a key component of a larger payment system. This segment, developed several years ago, has seen numerous hands in its maintenance, leading to a somewhat disorganized structure and unclear naming conventions. Additionally, the code lacks robust testing, and the existing tests are not particularly clear or effective.

A significant challenge is the system's performance limitations, partly due to its reliance on a slow database. The current setup uses a JSON file managed by the lowdb library, but for the sake of this scenario, think of it as a sluggish database. To address this, your team has decided to introduce a caching layer, aiming to minimize database calls and boost overall performance.

Another major focus is on refactoring the existing codebase. The goal here is to transform it into a more coherent, manageable, and developer-friendly structure. This revamp is essential for improving maintainability and facilitating more efficient future updates or modifications.

# Tasks
## Checklist
- [ ] Cut tickets
- [ ] Refactored the codebase
- [ ] Implemented a LRU cache
- [ ] Added Caching Layer to database calls

## Task 1 - Tickets (10 min)
In the first task, the case study should be broken down into tickets within the TICKETS.md file. Todo so list out all distinct tickets (only descriptive title) as a list that can be considered as individual work packages. Identify dependencies between tickets and mark them clearly. Also, highlight which tasks can be executed in parallel to optimize team efficiency. This approach will streamline the project flow and maximize productivity.

## Task 2 - Refactoring (30 min)
Refactor the codebase in `/src` to improve its structure and readability. Ensure that the code is clean, concise, and open to future modifications. You may add or remove files as needed. However, the code must remain functional and retain its original behavior.Feel free to add tests to enhance code coverage and verify the functionality of your code if you think it's necessary. However, be mindful of your time allocation, as dedicating too much effort to testing may not contribute to your overall evaluation. Keep in mind acronyms such as SOLID, KISS, DRY and YAGNI and your overall goal of the use case to not run into one way door decisions.

Files that should not be modified in this step but can be moved to a different location:
- `/src/lru-cache.ts`
- `/src/lru-cache.spec.ts`

## Task 3 - Caching (50 min)
Create a Least Recently Used (LRU) cache in the file `/lru-cache.ts`. This cache will help avoid unnecessary repeated data retrievals from the database. Make sure that the cache holds onto data for at least 5 minutes and does not exceed a set size limit.

Furthermore, integrate this cache directly into the data layer. You should ensure that any changes made to a data entry are updated in the cache. As a result when any data entry in your database is modified, these changes should immediately be reflected in the cache. This way, the next time someone requests this data, the system fetches it from the cache instead of querying the database again. This reduces database load and speeds up data retrieval.

### Example Implementation:
When a user is added or updated, this change is first written to the database. Simultaneously, the corresponding entry in the LRU cache is either updated or, if it's not already in the cache, added to the cache.

Let's say a user, Alice, updates her firstname. Here's what happens:

1. Alice's new firstname is saved in the database.
2. The cache checks if Alice's user data is currently stored.
   1. If yes, it updates the entry with the new firstname.
   2. If no, it adds a new entry for Alice's user with the updated firstname.
3. Now, when another part of your system requests Alice's users, it first checks the cache a.e. `GetAllUsers()`. Since the cache has the most recent data, it serves Alice's updated user with the new firstname, without needing to access the database.

This approach ensures data consistency and efficiency, as the most accessed data is quickly retrievable from the cache, and changes are immediately reflected without redundant database queries.


