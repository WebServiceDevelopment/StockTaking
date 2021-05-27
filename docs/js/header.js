/**************************************************************
 * Copyright (c) Web Service Development Inc 2020
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Web Service Development and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Web Service Development and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or
 * copyright law. Dissemination of this information or
 * reproduction of this material is strictly forbidden unless
 * prior written permission is obtained from Web Service
 * Development Inc.
 *
 * Author: Kosei Ogawa
 *
 *************************************************************/

"use strict";

/*
 *Initial number of lines.
 */
const DEFAULT_MIN_ROWS = 15;

/*
 * The first line is not '同じ'.
 */
const NOT_SAME_NAME_ROW = 1;
const ASSET_SAME = "同じ";

/*
 * Account.
 */
const ASSET_RAW_MATERIAL = "原材料";
const ASSET_IN_PROCESS_INVENTORY = "仕掛品";
const ASSET_PRODUCT = "製品";
const ASSET_DUST = "ダスト";

/*
 * Major classification of products.
 */
const PRODUCT_IRON = "鉄";
const PRODUCT_PLASTIC = "プラ";
const PRODUCT_BOARDS = "基板類";
const PRODUCT_USED_PAPER = "古紙";
const PRODUCT_RED_NON_FERROUS = "赤非鉄";
const PRODUCT_WHITE_NON_FERROUS = "白非鉄";
const PRODUCT_GOLD_SILVER = "金銀滓";
const PRODUCT_OTHERS = "その他";

/*
 * Number of columns of 10key.
 */
const CALC_COLUMNS = 3;

/*
 * Material board
 */
const MATERIAL_COLUMNS = 4;

/*
 * Minimum long press time.
 */
const MINIMUM_LONG_PRESS_TIME = 1000;

/*
 * Background color when row is locked.
 */
const LOCK_REVERSE_COLOR = "#f3f3f3";

/*
 * Double-click interval.
 */
const DOBLE_CLICK_TIMING_SLOW = 1000;
const DOBLE_CLICK_TIMING_FAST = 500;

/*
 * Write control for debugging.
 */
//const DEBUG_CONTROL			= 1;
const DEBUG_CONTROL = 0;

/*
 * Print control for debugging.
 */
const DEBUG_PRINT = 0;

/*
 *
 */
const F_COLUMN_NUMBER = 5;
const H_COLUMN_NUMBER = 7;
const TENKEY_AFTER_STRING = " 入力";


const DOT_COUNT_1 = "dot_count_1";
const ADD_BTN_1 = "add_btn_1";
const MIN_BTN_1 = "min_btn_1";

const DOT_COUNT_2 = "dot_count_2";
const ADD_BTN_2 = "add_btn_2";
const MIN_BTN_2 = "min_btn_2";

/*
 * Program outline
 *
 * There are two major objects in this program.
 * They are _core and Inventory.
 * The _core is an object that controls the whole.
 * The Inventory that controls the table is intentionally left out 
 * so as not to deepen the hierarchy of objects.
 */