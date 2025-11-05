/**
 * This file contains audio files that will have shared instances across multiple files
 */

import background_music_file from '../assets/game_sounds/background.mp3'

export const background_music = new Audio(background_music_file)
background_music.loop = true
