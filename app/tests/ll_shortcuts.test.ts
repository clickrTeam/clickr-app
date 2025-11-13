/**
 * This file is for testing the translation of shortcuts
 * into the expected format based on the OS.
 */
import { Profile } from '../src/models/Profile'
import * as utils from './test_utils/test_utils'
import { MacKey, WinKey, LinuxKey, Letters, Digits, Function } from '../src/models/Keys'
import * as T from '../src/models/Trigger'
import * as B from '../src/models/Bind'