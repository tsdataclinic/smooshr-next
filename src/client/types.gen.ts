// This file is auto-generated by @hey-api/openapi-ts

/**
 * The base Workflow model
 */
export type BaseWorkflow = {
  id: string;
  title: string;
  owner: string;
  created_date: string;
};

/**
 * Represents a data type with no additional configuration other
 * than its literal type
 */
export type BasicFieldDataTypeSchema = {
  dataType: 'any' | 'string' | 'number';
};

export type dataType = 'any' | 'string' | 'number';

export type Body_run_workflow = {
  upload_csv: Blob | File;
};

/**
 * The validation schema for a dataset column
 */
export type FieldSchema = {
  id: string;
  name: string;
  caseSensitive: boolean;
  required: boolean;
  dataTypeValidation: BasicFieldDataTypeSchema | TimestampDataTypeSchema;
  allowEmptyValues: boolean;
  allowedValues: string[] | ParamReference | null;
};

/**
 * The validation schema for a dataset's fieldset. Or, in other words,
 * the column schemas. E.g. the column names, order, data types, allowable values.
 */
export type FieldsetSchema_Input = {
  id: string;
  name: string;
  orderMatters: boolean;
  fields: FieldSchema[];
  allowExtraColumns: 'no' | 'anywhere' | 'onlyAfterSchemaFields';
};

export type allowExtraColumns = 'no' | 'anywhere' | 'onlyAfterSchemaFields';

/**
 * The validation schema for a dataset's fieldset. Or, in other words,
 * the column schemas. E.g. the column names, order, data types, allowable values.
 */
export type FieldsetSchema_Output = {
  id: string;
  name: string;
  orderMatters: boolean;
  fields: FieldSchema[];
  allowExtraColumns: 'no' | 'anywhere' | 'onlyAfterSchemaFields';
};

/**
 * A validation operation to validate the dataset columns and their values
 */
export type FieldsetSchemaValidation = {
  title: string;
  description: string | null;
  type: 'fieldsetSchemaValidation';
  id: string;
  fieldsetSchema: string | ParamReference;
};

export type type = 'fieldsetSchemaValidation';

/**
 * A validation operation to check file type
 */
export type FileTypeValidation = {
  title: string;
  description: string | null;
  type: 'fileTypeValidation';
  id: string;
  expectedFileType: string;
};

export type type2 = 'fileTypeValidation';

/**
 * A full workflow object, including the JSON schema
 */
export type FullWorkflow = {
  id: string;
  title: string;
  owner: string;
  created_date: string;
  schema: WorkflowSchema_Output;
};

export type HTTPValidationError = {
  detail?: ValidationError[];
};

/**
 * A simple object that references a param name
 */
export type ParamReference = {
  paramName: string;
};

/**
 * A validation operation to check row counts
 */
export type RowCountValidation = {
  title: string;
  description: string | null;
  type: 'rowCountValidation';
  id: string;
  minRowCount: number | null;
  maxRowCount: number | null;
};

export type type3 = 'rowCountValidation';

/**
 * Represents a Timestamp data type. It requires a `date_time_format` to
 * represent how a timestamp should be represented.
 */
export type TimestampDataTypeSchema = {
  dataType: 'timestamp';
  dateTimeFormat: string;
};

export type dataType2 = 'timestamp';

/**
 * The base User schema to use in the API.
 */
export type User = {
  id: string;
  email: string;
  identity_provider: string;
  family_name: string;
  given_name: string;
  created_date: string;
};

export type ValidationError = {
  loc: Array<string | number>;
  msg: string;
  type: string;
};

/**
 * Data model to create a new Workflow
 */
export type WorkflowCreate = {
  title: string;
};

/**
 * The schema representing an argument (an input) for the Workflow that
 * is passed in when a Workflow is kicked off.
 */
export type WorkflowParam = {
  name: string;
  displayName: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'string list';
};

export type type4 = 'string' | 'number' | 'string list';

/**
 * Run report schema for a server-side run of a workflow.
 */
export type WorkflowRunReport = {
  row_count: number;
  filename: string;
  workflow_id: string;
};

/**
 * A schema represents the sequence of operations a Workflow should apply.
 */
export type WorkflowSchema_Input = {
  version: '0.1';
  operations: Array<
    FieldsetSchemaValidation | FileTypeValidation | RowCountValidation
  >;
  fieldsetSchemas: FieldsetSchema_Input[];
  params: WorkflowParam[];
};

export type version = '0.1';

/**
 * A schema represents the sequence of operations a Workflow should apply.
 */
export type WorkflowSchema_Output = {
  version: '0.1';
  operations: Array<
    FieldsetSchemaValidation | FileTypeValidation | RowCountValidation
  >;
  fieldsetSchemas: FieldsetSchema_Output[];
  params: WorkflowParam[];
};

/**
 * Data model to update a Workflow
 */
export type WorkflowUpdate = {
  id: string;
  title: string;
  owner: string;
  created_date: string;
  schema: WorkflowSchema_Input;
};

export type GetSelfUserResponse = User;

export type GetSelfUserError = unknown;

export type GetWorkflowData = {
  path: {
    workflow_id: string;
  };
};

export type GetWorkflowResponse = FullWorkflow;

export type GetWorkflowError = HTTPValidationError;

export type DeleteWorkflowData = {
  path: {
    workflow_id: string;
  };
};

export type DeleteWorkflowResponse = unknown;

export type DeleteWorkflowError = HTTPValidationError;

export type GetWorkflowsResponse = BaseWorkflow[];

export type GetWorkflowsError = unknown;

export type CreateWorkflowData = {
  body: WorkflowCreate;
};

export type CreateWorkflowResponse = FullWorkflow;

export type CreateWorkflowError = HTTPValidationError;

export type UpdateWorkflowData = {
  body: WorkflowUpdate;
  path: {
    workflow_id: string;
  };
};

export type UpdateWorkflowResponse = FullWorkflow;

export type UpdateWorkflowError = HTTPValidationError;

export type RunWorkflowData = {
  body: Body_run_workflow;
  path: {
    workflow_id: string;
  };
};

export type RunWorkflowResponse = WorkflowRunReport;

export type RunWorkflowError = HTTPValidationError;

export type ReturnWorkflowData = {
  path: {
    workflow_id: string;
  };
};

export type ReturnWorkflowResponse = unknown;

export type ReturnWorkflowError = HTTPValidationError;
