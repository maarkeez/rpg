---
tags:
  - rpg-project
---
## Player

Actor who controls the battle units

- Id
- Type: human/cpu
- Name

## Unit

Available soldier to be deployed as a players battle unit

- Id
- Name
- Health Points
- Mana Points
- Abilities
    - Id
- Movement range

## Ability

Action a player can cast via a battle unit.

- Id
- Name
- Cost
- Cooldown
- Effects
- Target pattern
    - Self
    - Adjacent enemy

## Effect

Outcome of a casted ability that will affect one or more battle units.

- Id
- Type: Heal, Deal Damage
- Duration: Immediate
- Power
- Probability

## Battle unit

Deployed unit on the battlefield by a player

- Id
- Unit id
- Player id
- Remaining health points
- Remaining mana points
- Remaining turn actions: 
    - Move
        - Remaining steps
    - Cast ability
- Abilities
     - Ability id
     - Cooldown turns left

## Battlefield

Grid based game board 

- Rows
- Columns
- Tiles
    - Position
    - Occupying Unit id
    - Terrain
        - Id

## Terrain
 
- Id
- Name
- Terrain Effects
    - Id

## Terrain Effect

- Id
- Type
- Power

## Battle

- Turn queue 
- Current round
- Current player turn

---
### References

- [ChatGPT - Ideation](https://chatgpt.com/share/6a5e83fc-be88-83eb-b8bc-0644b9986fc6)
- [Miro board](https://miro.com/app/board/uXjVNXS3yqQ=/?share_link_id=391026102589)