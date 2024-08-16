// This file is auto-generated by @hey-api/openapi-ts

export const $HTTPValidationError = {
  properties: {
    detail: {
      items: {
        $ref: '#/components/schemas/ValidationError',
      },
      type: 'array',
      title: 'Detail',
    },
  },
  type: 'object',
  title: 'HTTPValidationError',
} as const;

export const $User = {
  properties: {
    id: {
      type: 'string',
      title: 'Id',
    },
    email: {
      type: 'string',
      title: 'Email',
    },
    identity_provider: {
      type: 'string',
      title: 'Identity Provider',
    },
    family_name: {
      type: 'string',
      title: 'Family Name',
    },
    given_name: {
      type: 'string',
      title: 'Given Name',
    },
    created_date: {
      type: 'string',
      format: 'date',
      title: 'Created Date',
    },
  },
  type: 'object',
  required: [
    'id',
    'email',
    'identity_provider',
    'family_name',
    'given_name',
    'created_date',
  ],
  title: 'User',
  description: 'The base User schema to use in the API.',
} as const;

export const $ValidationError = {
  properties: {
    loc: {
      items: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'integer',
          },
        ],
      },
      type: 'array',
      title: 'Location',
    },
    msg: {
      type: 'string',
      title: 'Message',
    },
    type: {
      type: 'string',
      title: 'Error Type',
    },
  },
  type: 'object',
  required: ['loc', 'msg', 'type'],
  title: 'ValidationError',
} as const;

export const $Workflow = {
  properties: {
    id: {
      type: 'integer',
      title: 'Id',
    },
    title: {
      type: 'string',
      title: 'Title',
    },
    owner: {
      type: 'integer',
      title: 'Owner',
    },
    created_date: {
      type: 'string',
      format: 'date-time',
      title: 'Created Date',
    },
    schema: {
      anyOf: [
        {
          type: 'object',
        },
        {
          type: 'null',
        },
      ],
      title: 'Schema',
    },
  },
  type: 'object',
  required: ['id', 'title', 'owner', 'created_date'],
  title: 'Workflow',
  description: 'The base Workflow schema to use in the API.',
} as const;

export const $WorkflowCreate = {
  properties: {
    title: {
      type: 'string',
      title: 'Title',
    },
  },
  type: 'object',
  required: ['title'],
  title: 'WorkflowCreate',
  description: 'Data model to create a new Workflow',
} as const;

export const $WorkflowUpdate = {
  properties: {},
  type: 'object',
  title: 'WorkflowUpdate',
  description: 'Data model to update a Workflow',
} as const;
