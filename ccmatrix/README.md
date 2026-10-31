# ccmatrix

The falling green text from The Matrix, in your terminal. It's my solution to
[Coding Challenge #144](https://codingchallenges.fyi/).

It's a single Python 3 script with no dependencies. It drives the terminal directly
with `termios` (raw mode) and ANSI escape codes, with no curses.

```sh
./ccmatrix            # press q to quit, 0-9 to change speed
./ccmatrix -s         # screensaver: any key or mouse event exits
./ccmatrix -c -C cyan -u 2
```

## Options

| Flag | Effect |
|------|--------|
| `-s` | Screensaver mode: exit on any key press, mouse click or mouse movement |
| `-u N` | Delay between updates, 0 (fastest) to 10 (slowest). Default 4. Keys `0`-`9` change it while running |
| `-C COLOUR` | Trail colour: green (default), red, blue, white, yellow, cyan, magenta, black. Heads stay white |
| `-r` | Rainbow trails |
| `-c` | Half-width katakana instead of letters and digits |
| `-b` / `-B` | Make some / all characters bold |
| `-a` | Asynchronous scroll: each trail picks its own speed (by default, each column has a fixed speed) |
| `-f` | Characters in the trails flicker and change as they fall |
| `-t` | 24-bit colour with a smooth fade along each trail |
| `-M TEXT` | Message mode: the rain periodically resolves into `TEXT` in the middle of the screen |

A bad `-u` or `-C` value prints an error and exits with status 2 without drawing anything.

## Config file

Default options can go in `~/.ccmatrixrc`, or in the file named by `$CCMATRIX_CONFIG`.
Write them the same way you would on the command line. `#` starts a comment.

```
# ~/.ccmatrixrc
-c -C cyan -f
```

## How it works

- **Terminal:** puts stdin in raw mode, switches to the alternate screen, and hides
  the cursor and turns autowrap off. A `finally` block undoes all of that on exit,
  including on SIGTERM and SIGHUP. Ctrl-C arrives as a byte in raw mode and quits
  like `q` does.
- **Input:** `select()` waits for a key or for the next frame, whichever comes first.
  Escape sequences such as arrow keys are skipped, so their digits don't change the speed.
- **Drawing:** each column holds one or more drops. When a drop moves down a row,
  only the cells whose look changes are redrawn: the new head, the cells where the
  trail changes band, and the cell that goes blank at the tail. Nothing redraws the
  whole screen, so CPU use stays low: about 2% at the default speed on a 200x50 terminal.
- **Resize:** SIGWINCH sets a flag. The main loop then resizes the column state,
  keeping the drops that still fit, and redraws the screen.
