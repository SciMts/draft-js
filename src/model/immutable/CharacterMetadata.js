/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CharacterMetadata
 * @typechecks
 * @flow
 */

'use strict';

var {
  Map,
  OrderedSet,
  Record,
} = require('immutable');

import type {DraftInlineStyle} from 'DraftInlineStyle';

// Immutable.map is typed such that the value for every key in the map
// must be the same type
type CharacterMetadataConfigValueType = DraftInlineStyle | ?string;

type CharacterMetadataConfig = {
  style?: CharacterMetadataConfigValueType,
  entity?: CharacterMetadataConfigValueType,
};

const EMPTY_SET = OrderedSet();

var makeConfigKey = function makeConfigKey(config) {
  return config.style + config.entity;
};


var defaultRecord: CharacterMetadataConfig = {
  style: EMPTY_SET,
  entity: null,
};

var CharacterMetadataRecord = Record(defaultRecord);

class CharacterMetadata extends CharacterMetadataRecord {
  getStyle(): DraftInlineStyle {
    return this.get('style');
  }

  getEntity(): ?string {
    return this.get('entity');
  }

  hasStyle(style: string): boolean {
    return this.getStyle().has(style);
  }

  static applyStyle(
    record: CharacterMetadata,
    style: string,
  ): CharacterMetadata {
    var withStyle = record.set('style', record.getStyle().add(style));
    return CharacterMetadata.create(withStyle);
  }

  static removeStyle(
    record: CharacterMetadata,
    style: string,
  ): CharacterMetadata {
    var withoutStyle = record.set('style', record.getStyle().remove(style));
    return CharacterMetadata.create(withoutStyle);
  }

  static applyEntity(
    record: CharacterMetadata,
    entityKey: ?string,
  ): CharacterMetadata {
    var withEntity = record.getEntity() === entityKey ?
      record :
      record.set('entity', entityKey);
    return CharacterMetadata.create(withEntity);
  }

  /**
   * Use this function instead of the `CharacterMetadata` constructor.
   * Since most content generally uses only a very small number of
   * style/entity permutations, we can reuse these objects as often as
   * possible.
   */
  static create(config?: CharacterMetadataConfig): CharacterMetadata {
    if (!config) {
      return EMPTY;
    }

    const defaultConfig = {style: EMPTY_SET, entity: (null: ?string)};
    // Fill in unspecified properties, if necessary.
    var mergedConfig = Object.assign({}, defaultConfig, config);
    const key = makeConfigKey(mergedConfig);

    var existing = pool[key];
    if (existing) {
      return existing;
    }

    var newCharacter = new CharacterMetadata(mergedConfig);
    pool[key] = newCharacter;
    return newCharacter;
  }
};

var EMPTY = new CharacterMetadata();
var pool = {}

CharacterMetadata.EMPTY = EMPTY;

module.exports = CharacterMetadata;
