// Player

import { Audio } from './Audio';
//import { CombatSystem } from './CombatSystem';
import {
    TURN_FRAMES,
    TYPE_DOOR,
    TYPE_HIDDEN,
    TYPE_EXAMINE_ONLY
} from './Constants';
import { Game } from './Game';
import { Input } from './Input';
import { InventoryScreen } from './InventoryScreen';
import { Log } from './Log';
import { Screen } from './Screen';
import { World } from './World';
import {
    $D_CLOSET,
    $D_CLOSET_OPEN,
    $D_DINING,
    $D_DINING_OPEN,
    $D_DRAW,
    $D_FOYER,
    $D_GARAGE,
    $D_GARAGED,
    $D_KITCHEN,
    $D_HALLWAY,
    $F_ALTAR,
    $F_ALTAR_A,
    $F_BURNT_CHAIR,
    $F_BURNT_CHAIR_A,
    $F_DRAWER1,
    $F_DRAWER1_A,
    $F_DOLLHOUSE,
    $F_DOLLHOUSE_A,
    $F_DOLLHOUSE_B,
    $F_DOLLHOUSE_C,
    $F_DOLLHOUSE_D,
    $F_GRAFFITI,
    $F_SHELF3,
    $F_SHELF3_A,
    $F_STATUE,
    $F_STATUE_A,
    $F_STATUE_B,
    $H_WORKBENCH,
    $H_STATUE2,
    $H_STATUE2_A,
    $H_STATUE2_B,
    $I_BURNT_NOTEBOOK,
    $I_DOLL_WORKBENCH,
    $I_DOLL_SCULPTURE,
    $I_ENGRAVED_COIN,
    $I_IRON_KNIFE,
    $I_SCREWDRIVER,
    $I_SILVER_KEY,
    $I_UNCLE_LETTER,
    $R_CLOSET,
    $R_DRAW,
    $R_DINING,
    $R_GARAGE,
    $R_HALLWAY
} from './WorldData-gen';
//import { WorldParticle } from './WorldParticle';

export class Player {
    constructor(pos) {
        this.pos = { ...pos };

        this.lookingAt = this.room;
        this.inventory = [];

        this.speed = 4;
        this.hp = this.hpMax = 100;
        this.sp = this.spMax = 100;

        // *COMBAT*
        // this.vigor = 8;
        // this.insight = 12;
        // this.will = 10;
        // this.updateStats();
        // this.weapon = { ar: 0.5 };
        // this.df = flood(this.pos);

        // The player starts with the uncle's letter.
        this.obtainItem($I_UNCLE_LETTER);

        // The foyer door is locked.
        World.objectsById($D_FOYER, object => object.finished = true);

        // The player is in the foyer (starting room).
        this.room = World.roomAt(this.pos);
        Log.add(World.strings[this.room.id][1]);
        World.makeVisible(this.room.id);

        // Temporary hack stuff
        this.obtainItem($I_IRON_KNIFE);
        this.obtainItem($I_BURNT_NOTEBOOK);
        this.obtainItem($I_SILVER_KEY);
        this.obtainItem($I_SCREWDRIVER);
        this.obtainItem($I_DOLL_SCULPTURE);
    }

    draw() {
        Screen.writeOnMap(this.pos.x, this.pos.y, '@', Screen.WHITE | Screen.BRIGHT);
    }

    update() {
        let move;

        if (Input.held[Input.Action.LEFT] && Input.framesHeld[Input.Action.LEFT] % TURN_FRAMES === 1) {
            move = { ...this.pos, x: this.pos.x - 1 };
        } else if (Input.held[Input.Action.RIGHT] && Input.framesHeld[Input.Action.RIGHT] % TURN_FRAMES === 1) {
            move = { ...this.pos, x: this.pos.x + 1 };
        } else if (Input.held[Input.Action.UP] && Input.framesHeld[Input.Action.UP] % TURN_FRAMES === 1) {
            move = { ...this.pos, y: this.pos.y - 1 };
        } else if (Input.held[Input.Action.DOWN] && Input.framesHeld[Input.Action.DOWN] % TURN_FRAMES === 1) {
            move = { ...this.pos, y: this.pos.y + 1 };
        }

        if (move) {
            this.interactWith(move);
        }
        return !!move;
    }

    interactWith(pos) {
        let tile = World.tileAt(pos);
        let object = World.objectAt(pos);
        let entity = Game.entityAt(pos);

        if (entity) {
            // *COMBAT*
            // this.attack(entity);
        } else if (object && object.type !== TYPE_HIDDEN) {
            if (object.open) {
                this.moveInto(pos, false);
            } else if (object.finished) {
                this.lookingAt = object;
                Log.add(World.strings[object.id]);
            } else {
                /**** SPECIAL OBJECTS ****/
                if (object.id === $D_CLOSET) {
                    Log.add(World.strings[object.id]);
                    if (object.interacted) {
                        this.openInventoryFor(object);
                    }
                } else if (object.id === $D_DINING) {
                    Log.add(World.strings[object.id]);
                    if (object.interacted) {
                        this.openInventoryFor(object);
                    }
                } else if (object.id === $D_DRAW) {
                    this.openDoor(object);
                    World.makeVisible($R_DRAW);
                } else if (object.id === $D_KITCHEN) {
                    Log.add(World.strings[object.id]);
                } else if (object.id === $D_GARAGE) {
                    this.openDoor(object);
                    World.makeVisible($R_GARAGE);
                } else if (object.id === $D_GARAGED) {
                    Log.add(World.strings[object.id]);
                    this.sp -= 3;
                    Screen.smudge = 4;
                    World.objectsById($D_GARAGED, object => object.finished = true);
                } else if (object.id === $D_HALLWAY) {
                    this.openDoor(object);
                    World.makeVisible($R_HALLWAY);
                } else if (object.id === $F_ALTAR) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_ALTAR_A;
                } else if (object.id === $F_ALTAR_A) {
                    object.finished = true;
                    Log.obtainedItem($I_DOLL_SCULPTURE);
                    this.obtainItem($I_DOLL_SCULPTURE);
                } else if (object.id === $F_BURNT_CHAIR) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_BURNT_CHAIR_A;
                } else if (object.id === $F_BURNT_CHAIR_A) {
                    object.finished = true;
                    Log.obtainedItem($I_BURNT_NOTEBOOK);
                    this.obtainItem($I_BURNT_NOTEBOOK);
                } else if (object.id === $F_DRAWER1) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_DRAWER1_A;
                } else if (object.id === $F_DRAWER1_A) {
                    object.finished = true;
                    Log.obtainedItem($I_SILVER_KEY);
                    this.obtainItem($I_SILVER_KEY);
                } else if (object.id === $F_DOLLHOUSE) {
                    Log.add(World.strings[object.id]);
                    if (object.interacted) {
                        this.openInventoryFor(object);
                    }
                } else if (object.id === $F_DOLLHOUSE_B) {
                    Log.add(World.strings[object.id]);
                    this.openInventoryFor(object);
                } else if (object.id === $F_GRAFFITI) {
                    Log.add(World.strings[object.id]);
                    this.sp--;
                    Screen.smudge = 2;
                    World.objectsById($F_GRAFFITI, object => object.finished = true);
                } else if (object.id === $F_SHELF3) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_SHELF3_A;
                } else if (object.id === $F_SHELF3_A) {
                    object.finished = true;
                    Log.obtainedItem($I_DOLL_WORKBENCH);
                    this.obtainItem($I_DOLL_WORKBENCH);
                } else if (object.id === $F_STATUE) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_STATUE_A;
                } else if (object.id === $F_STATUE_A) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_STATUE_B;
                    object.finished = true;
                    this.sp--;
                    this.obtainItem($I_IRON_KNIFE);
                } else if (object.id === $H_STATUE2) {
                    Log.add(World.strings[object.id]);
                    object.id = $H_STATUE2_A;
                } else if (object.id === $H_STATUE2_A) {
                    Log.add(World.strings[object.id]);
                    object.id = $H_STATUE2_B;
                    object.finished = true;
                    this.sp--;
                    this.obtainItem($I_ENGRAVED_COIN);
                } else if (object.type === TYPE_DOOR) {
                    this.openDoor(object);
                } else if (object.type === TYPE_EXAMINE_ONLY) {
                    Log.add(World.strings[object.id]);
                    object.finished = true;
                    this.sp--;
                } else {
                    let action = '';
                    if (object.action) {
                        action = `\n${object.action}`;
                    } else if (object.interacted) {
                        action = `\n%y\xa5 You need some kind of other item.`;
                    }
                    this.lookingAt = object;
                    Log.add(World.strings[object.id] + action);
                }
            }

            object.interacted = true;
        } else if (tile === World.FLOOR) {
            this.moveInto(pos, true);
        } else {
            // UNUSED
        }
    }

    moveInto(pos, updateRoom) {
        this.pos = pos;
        //this.df = flood(this.pos);
        if (updateRoom) {
            // This is a cheap, easy way to make doors part of "both rooms" - when you step
            // between rooms, the current room description doesn't update until you walk
            // past the doorway.
            let room = World.roomAt(this.pos);
            if (this.room !== room) {
                Log.add(World.strings[room.id][1]);
            }
            this.room = room;
            this.lookingAt = this.room;
        }

        Audio.playShit();
    }

    openInventoryFor(object) {
        Game.screens.push(new InventoryScreen(object));
    }

    useItemOn(object, item) {
        if (object.id === $D_CLOSET && item === $I_SCREWDRIVER) {
            this.openDoor(object, $D_CLOSET_OPEN);
            this.sp -= 3;
            World.makeVisible($R_CLOSET);
        } else if (object.id === $D_DINING && item === $I_IRON_KNIFE) {
            this.openDoor(object, $D_DINING_OPEN);
            World.makeVisible($R_DINING);
        } else if (object.id === $F_DOLLHOUSE && item === $I_SILVER_KEY) {
            Log.add(World.strings[$F_DOLLHOUSE_A]);
            object.id = $F_DOLLHOUSE_B;
            this.removeItem($I_SILVER_KEY);
        } else if (object.id === $F_DOLLHOUSE_B && item === $I_DOLL_WORKBENCH) {
            Log.add(World.strings[$F_DOLLHOUSE_C]);
            this.removeItem($I_DOLL_WORKBENCH);
            World.objectsById($H_WORKBENCH, object => {
                object.type = 0;
                object.char = '\xa7';
            });
        } else if (object.id === $F_DOLLHOUSE_B && item === $I_DOLL_SCULPTURE) {
            Log.add(World.strings[$F_DOLLHOUSE_D]);
            this.removeItem($I_DOLL_SCULPTURE);
            World.objectsById($H_STATUE2, object => {
                object.type = 0;
                object.char = '&';
            });
        } else {
            Log.add(`%y%0 That doesn't work here.`);
        }
    }

    hasItem(id) {
        return this.inventory.includes(id);
    }

    obtainItem(id) {
        this.inventory.push(id);
    }

    removeItem(id) {
        this.inventory = this.inventory.filter(objectId => objectId !== id);
    }

    openDoor(object, stringId) {
        if (stringId) {
            Log.add(World.strings[stringId]);
        } else {
            Log.add('You push the door open.', '%y');
        }
        object.open = object.finished = true;
        object.char = object.char === '|' ? `'` : '\x7f';
    }

    // *COMBAT*
    /*
    attack(entity) {
        let roll = CombatSystem.rollAttack(this.vigor, this.weapon.ar);
        if (roll.result === CombatSystem.WHIFF) {
            Log.add('%YYou slash at the swamp rat, but miss.');
        } else if (roll.result === CombatSystem.HIT) {
            Log.add(`%YYou slash the ${CombatSystem.formatActeeName(entity)}, dealing ${roll.value} damage.`);
        } else if (roll.result === CombatSystem.CRIT) {
            Log.add(`%YFocus! You slash the ${CombatSystem.formatActeeName(entity)}, dealing ${roll.value} damage.`);
        }
        Game.entities.push(new WorldParticle(entity.pos, [['/', Screen.YELLOW], ['*', Screen.YELLOW]]));
        Game.entities.push(new WorldParticle(Game.player.pos, [['@', Screen.YELLOW]]));
    }

    updateStats() {
        this.lvl = this.vigor + this.insight + this.will;

        let hpMax = this.vigor * 10 + this.lvl - 10;

        if (hpMax > this.hpMax) {
            this.hpMax = hpMax;
            this.hp += (hpMax - this.hpMax);
        }

        let spMax = this.will * 10 + this.lvl - 30;

        if (spMax > this.spMax) {
            this.spMax = spMax;
            this.sp += (spMax - this.spMax);
        }
    }
    */
}
