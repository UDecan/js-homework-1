class Validator {
  constructor() {
    this._errors = [];
  }

  get Errors() {
    return this._errors;
  }
  
  validateArray(schema, data) {
    if (data === null) {
      return !!schema.nullable;
    }

    if (!Array.isArray(data)) {
      this._errors.push('Type is incorrect')

      return false;
    }

    if (data.length < schema.minItems) {
      this._errors.push('Items count less than can be')

      return false;
    }

    if (data.length > schema.maxItems) {
      this._errors.push('Items count more than can be')

      return false;
    }

    if (schema.contains && !data.map(JSON.stringify).includes(JSON.stringify(schema.contains))) {
      this._errors.push('Must contain a value, but does not');

      return false;
    }

    if (schema.items) {
      if (schema.items.type) {
        if (data.some(item => typeof item !== schema.items.type)) {
          this._errors.push('Type is incorrect');

          return false;
        }
      } else {
        if (data.some((item, index) => typeof item !== schema.items[index].type)) {
          this._errors.push('Type is incorrect');

          return false;
        }
      }
    }

    if (schema.enum) {
      const jsonArray = schema.enum.map(item => JSON.stringify(item));

      if (!jsonArray.includes(JSON.stringify(data))) {
        this._errors.push('The enum does not support one of array elements');

        return false;
      }
    }

    if (schema.uniqueItems) {
      let mySet = new Set(data.map(item => JSON.stringify(item)));

      if (mySet.size !== data.length) {
        this._errors.push('Elements of array not unique');

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
    if (data === null) {
      return !!schema.nullable;
    }

    if (typeof data !== 'boolean') {
      this._errors.push('Type is incorrect');

      return false;
    }

    return true;
  }

  validateObject(schema, data) {
    if (data === null) {
      return !!schema.nullable;
    }

    if ((typeof data !== 'object' || Array.isArray(data))) {
      this._errors.push('Type is incorrect');

      return false;
    }

    if (Object.keys(data).length < schema.minProperties) {
      this._errors.push('Too few properties in object');
      
      return false;
    } 

    if (Object.keys(data).length > schema.maxProperties) {
      this._errors.push('Too many properties in object');

       return false;
    }
    
    if (schema.required && !schema.required.every(field => field in data)) {
      this._errors.push('Property required, but value is undefined');

      return false;
    }

    if (schema.properties && schema.additionalProperties === false &&
      Object.keys(schema.properties).length !== Object.keys(data).length) {
      this._errors.push('An object cant have additional properties');
      
      return false;
    }

    if (schema.properties) {
      const valid = Object.keys(schema.properties).every((element) => {
        const localSchema = schema.properties[element];
        const localData = data[element];

        return this.isValid(localSchema, localData);
      });
      
      if (!valid) {
        this._errors.push('Type is incorrect');

        return false;
      }
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

    if (dataToValidate === null) {
      if (!schema.nullable) {
        this._errors.push('Value is null, but nullable false');
      }

      return !!schema.nullable;
    }

    if (schema.anyOf) {            
      let numberValide = 0;
      schema.anyOf.forEach(localSchema => {
        if (this.isValid(localSchema, dataToValidate)) {
          numberValide++;
        }
      });

      this._errors = [];

      if (!numberValide) {
        this._errors.push('None schemas are valid');
      }

      return !!numberValide;
    }

    if (schema.oneOf) {
      let numberValide = 0;
      schema.oneOf.forEach(localSchema => {
        if (this.isValid(localSchema, dataToValidate)) {
          numberValide++;
        }
      });

      this._errors = [];

      if (numberValide > 1) {
        this._errors.push('More than one shema valid for this data');
      }

      if (!numberValide) {
        this._errors.push('None schemas are valid');
      }

      return numberValide === 1;
    }

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
        this._errors.push('Unknown type');

        return false;
    }
  }
}
