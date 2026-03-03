# Agentforce Vibes Demo

This is a demo repository for Agentforce Vibes.

# Contributing

Contributions will not accepted.

# Data Model


```mermaid
classDiagram
    class Actor {
        +int id (PK)
        +varchar name
    }

    class Movie {
        +int id (PK)
        +varchar title
        +text description
        +GenreEnum genre
        +int year
        +int runtime_minutes
        +float rating
        +int votes
        +float revenue_millions
        +int metascore
    }

    class MovieActor {
        +int movie_id (FK)
        +int actor_id (FK)
    }

    class Director {
        +int id (PK)
        +varchar name
    }

    class MovieDirector {
        +int movie_id (FK)
        +int director_id (FK)
    }

    Movie "1" -- "0..*" MovieActor : features
    Actor "1" -- "0..*" MovieActor : performs_in
    Movie "1" -- "0..*" MovieDirector : directed_by
    Director "1" -- "0..*" MovieDirector : directs
```
