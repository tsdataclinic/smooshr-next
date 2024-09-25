import * as React from 'react';
import { Title, Group, Text, FileButton, Button } from '@mantine/core';
import {
  FullWorkflow,
  WorkflowRunReport,
  WorkflowsService,
} from '../../../client';
import { useMutation } from '@tanstack/react-query';
import { processAPIData } from '../../../util/apiUtil';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import pluralize from 'pluralize';

type Props = {
  workflow: FullWorkflow;
};

// TODO: eventually this shouldnt be needed, we should convert Frictionless errors
// to validation errors instead of HTTP errors.
const WorkflowErrorSchema = z.object({
  detail: z.object({
    errors: z.array(z.array(z.string())),
  }),
});

export function TestWorkflowBlock({ workflow }: Props): JSX.Element {
  const [file, setFile] = React.useState<File | undefined>();
  const [workflowReport, setWorkflowReport] = React.useState<
    WorkflowRunReport | undefined
  >(undefined);
  const runWorkflowMutation = useMutation({
    mutationFn: async (params: { fileToUpload: File; workflowId: string }) => {
      return processAPIData(
        WorkflowsService.runWorkflow({
          path: {
            workflow_id: params.workflowId,
          },
          body: {
            file: params.fileToUpload,
          },
        }),
      );
    },
  });

  console.log('report', workflowReport);

  return (
    <div className="space-y-3">
      <Group>
        <Text>Upload a CSV to test</Text>
        <FileButton
          onChange={(uploadedFile: File | null) => {
            setFile(uploadedFile ?? undefined);
          }}
          accept=".csv"
        >
          {(props) => (
            <Button variant="outline" {...props}>
              Upload CSV
            </Button>
          )}
        </FileButton>
        {file ? <Text>{file.name}</Text> : null}
      </Group>

      {workflowReport ? (
        <>
          <Title order={4}>Results for {workflowReport.filename}</Title>
          <Text>Total rows processed: {workflowReport.rowCount}</Text>
          {workflowReport.validationFailures.length === 0 ? (
            <Text className="font-bold text-green-600">No errors found!</Text>
          ) : (
            workflowReport.validationFailures.map((failure) => {
              return (
                <Text key={`${failure.message}-${failure.rowNumber}`}>
                  {failure.message} in row {failure.rowNumber}
                </Text>
              );
            })
          )}
        </>
      ) : null}

      <Button
        disabled={!file}
        onClick={() => {
          if (file) {
            runWorkflowMutation.mutate(
              { fileToUpload: file, workflowId: workflow.id },
              {
                onSuccess: (report: WorkflowRunReport) => {
                  setWorkflowReport(report);
                  if (report.validationFailures.length === 0) {
                    notifications.show({
                      title: 'Workflow completed successfully!',
                      message: 'No errors found',
                    });
                  } else {
                    notifications.show({
                      color: 'yellow',
                      title: 'Workflow finished with errors',
                      message: `Found ${pluralize('error', report.validationFailures.length, true)}`,
                    });
                  }
                },
                onError: (error) => {
                  const parseResult = WorkflowErrorSchema.safeParse(
                    JSON.parse(error.message),
                  );
                  if (parseResult.success) {
                    const errorDetails = parseResult.data;
                    console.log(errorDetails);
                  }
                },
              },
            );
          }
        }}
      >
        Run Workflow
      </Button>
    </div>
  );
}
