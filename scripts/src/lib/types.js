"use strict";
// src/lib/types.ts
// This file now serves as the entry point for all types
// Just re-exporting from domain-specific files
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Re-export all types from domain files
__exportStar(require("./types/auth-types"), exports);
__exportStar(require("./types/spell-types"), exports);
__exportStar(require("./types/equipment-types"), exports);
__exportStar(require("./types/wizard-types"), exports);
__exportStar(require("./types/enemy-types"), exports);
__exportStar(require("./types/combat-types"), exports);
__exportStar(require("./types/game-types"), exports);
__exportStar(require("./types/market-types"), exports);
__exportStar(require("./types/achievement-types"), exports);
