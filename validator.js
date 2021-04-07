class Validator {
  constructor() {
    this._errors = [];
  }

  get Errors() {
    return this._errors;
  }
  
  validateArray(schema, data) {
    if (Array.isArray(data)) {
      this._errors.push('Type is incorrect')
      return false;
    }

    if (data.length < schema.minItems) {
      return false;
    }

    if (data.length > schema.maxItems) {
      return false;
    }

    if (data.includes(schema.contains) === false) {
      return false;
    }

    if (schema.uniqueItems) {
      const testArray = [];
      data.forEach((element, index, array) => {
        if (array.lastindexof(element) === index && !testArray.includes(element)) {
          testArray.push(element);
        }
      });
      if (testArray.length !== data.length) {
        return false;
      }
    }

    return true;
  }

  validateNumber(schema, data) {
    if (typeof data !== 'number') {
      this._errors.push('Type is incorrect');
      return false;
    }

    if (schema.enum?.includes(data) === false) {
      this._errors.push('The enum does not support value');
      return false;
    }

    if (data > schema.maximum) {
      this._errors.push('Value is greater than it can be');
      return false;
    }

    if (data < schema.minimum) {
      this._errors.push('Value is less than it can be');
      return false;
    }

    return true;
  }

  validateString(schema, data) {
    if (typeof data !== 'string') {
      this._errors.push('Type is incorrect');
      return false;
    }

    if (data.length > schema.maxLength) {
      this._errors.push('Too long string');
      return false;
    }

    if (data.length < schema.minLength) {
      this._errors.push('Too short string');
      return false;
    }

    if (schema.enum && !schema.enum.includes(data)) {
      this._errors.push('The enum does not support value');
      return false;
    }

    if (schema.pattern && !schema.pattern.test(data)) {
      this._errors.push('String does not match pattern');
      return false;
    }

    
    if (schema.format === 'email') {
      if (!/\S+@\S+\.\S+/.test(data)) {
        this._errors.push('Format of string is not valid');
        return false;
      }
    }

    if (schema.format === 'date') {
      if (!Date.parse(data)) {
        this._errors.push('Format of string is not valid');
        return false;
      }
    }

    return true;
  }

  validateBoolean(schema, data) {
    if (typeof data !== 'boolean' && !schema.nullable) {
      this._errors.push('Type is incorrect');
      return false;
    }

    if (!schema.nullable && data === null) {
      console.log(schema, data);
      return false;
    }

    return true;
  }

  validateObject(schema, data) {
    if ((typeof data !== 'object' || Array.isArray(data)) && !schema.nullable) {
      this._errors.push('Type is incorrect');
      return false;
    }

    if (data > schema.minProperties) {
      this._errors.push('Type is incorrect');
      return false;
    }
    return true;
   }

  /**
   *
   * @param schema
   * @param dataToValidate
   * @returns {boolean}
   */
  isValid(schema = {}, dataToValidate) {
    switch (schema.type) {
      case 'string':
        return this.validateString(schema, dataToValidate);
      case 'array':
        return this.validateArray(schema, dataToValidate);
      case 'object':
        return this.validateObject(schema, dataToValidate);
      case 'number':
        return this.validateNumber(schema, dataToValidate);
      case 'boolean':
        return this.validateBoolean(schema, dataToValidate);
      default:
        return false;
    }
  }
}
