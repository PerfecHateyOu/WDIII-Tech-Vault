/**
 * WDIII Tech Vault - Step 6 Phase 6A: Community Research Hub Data Models & Schema Definitions
 * 
 * Defines TypeScript interfaces, JSON Schemas, and runtime validation contracts
 * for experiments, community replication submissions, and administrative audit logs.
 */

/**
 * 1. Experiment Dynamic Measurement Schema Field
 * Defines the contract for an empirical metric accepted for a given protocol.
 */
export interface MeasurementSchemaField {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean';
  unit?: string;
  required: boolean;
  min?: number;
  max?: number;
}

/**
 * Experiment Document Model
 * Stored at: /experiments/{experimentId}
 */
export interface ExperimentDocument {
  id: string;
  experimentNumber: string;
  title: string;
  category: 'repair' | 'support' | 'software' | 'legal' | 'hardware' | 'ecosystem' | 'ai';
  status: 'done' | 'progress' | 'pending' | 'paused' | 'queued' | 'draft' | 'private';
  statusLabel?: string;
  origin: 'official_wdiii' | 'community';
  researchQuestion: string;
  objective: string;
  methodology: string;
  conditions: string;
  protocol: string;
  protocolVersion: string;
  version: string;
  measurementSchema: MeasurementSchemaField[];
  allowedMeasurementKeys: string[];
  measurements?: Record<string, any>;
  results?: string;
  observations?: string[];
  limitations?: string;
  verdict?: string;
  devices: string[];
  sources?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Evidence File Metadata Model
 */
export interface SubmissionEvidence {
  name: string;
  fileName?: string;
  path?: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

/**
 * Submission Moderation Review Model
 */
export interface SubmissionReview {
  reviewerId: string;
  reviewedAt: string;
  feedback: string;
}

/**
 * Submission Provenance Model
 */
export interface SubmissionProvenance {
  source: 'community';
  protocolVersion: string;
  experimentVersion: string;
}

/**
 * 2. Community Replication Submission Document Model
 * Stored at: /submissions/{submissionId}
 */
export type SubmissionStatus = 'draft' | 'pending_review' | 'needs_revision' | 'approved' | 'rejected' | 'withdrawn';

export interface SubmissionDocument {
  id: string;
  authorId: string;
  authorDisplayName: string;
  deviceId: string;
  experimentId: string;
  type: 'replication';
  status: SubmissionStatus;
  measurements: Record<string, { value: number | string | boolean; unit?: string } | number | string | boolean>;
  conditions: Record<string, any>;
  notes?: string;
  evidence: SubmissionEvidence[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  review?: SubmissionReview | null;
  provenance: SubmissionProvenance;

  // Backward compatibility aliases for dual-field indexing
  userId?: string;
  submitterName?: string;
  submitterEmail?: string;
  evidenceReferences?: SubmissionEvidence[];
  reviewerId?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
}

/**
 * 3. Immutable Administrative Moderation Audit Log Model
 * Stored at: /admin_audit_logs/{logId}
 */
export interface AdminAuditLogDocument {
  id: string;
  action: 'approve_submission' | 'reject_submission' | 'request_revision' | 'revert_submission' | string;
  actorId: string;
  targetSubmissionId: string;
  previousStatus: SubmissionStatus | string;
  newStatus: SubmissionStatus | string;
  reason: string;
  timestamp: string;
}

/**
 * JSON Schema Specification for Phase 6A Collections
 */
export const Phase6ASchemas = {
  experiment: {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Experiment",
    type: "object",
    required: ["id", "title", "category", "origin", "status", "measurementSchema", "allowedMeasurementKeys"],
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      category: { 
        type: "string", 
        enum: ["repair", "support", "software", "legal", "hardware", "ecosystem", "ai"] 
      },
      origin: { type: "string", enum: ["official_wdiii", "community"] },
      status: { type: "string" },
      protocolVersion: { type: "string" },
      version: { type: "string" },
      measurementSchema: {
        type: "array",
        items: {
          type: "object",
          required: ["key", "label", "type", "required"],
          properties: {
            key: { type: "string" },
            label: { type: "string" },
            type: { type: "string", enum: ["number", "string", "boolean"] },
            unit: { type: "string" },
            required: { type: "boolean" },
            min: { type: "number" },
            max: { type: "number" }
          }
        }
      },
      allowedMeasurementKeys: {
        type: "array",
        items: { type: "string" }
      }
    }
  },

  submission: {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Submission",
    type: "object",
    required: [
      "authorId", 
      "authorDisplayName", 
      "deviceId", 
      "experimentId", 
      "type", 
      "status", 
      "measurements", 
      "conditions", 
      "evidence", 
      "createdAt", 
      "updatedAt", 
      "provenance"
    ],
    properties: {
      id: { type: "string" },
      authorId: { type: "string" },
      authorDisplayName: { type: "string" },
      deviceId: { type: "string" },
      experimentId: { type: "string" },
      type: { type: "string", enum: ["replication"] },
      status: { 
        type: "string", 
        enum: ["draft", "pending_review", "needs_revision", "approved", "rejected", "withdrawn"] 
      },
      measurements: { type: "object" },
      conditions: { type: "object" },
      notes: { type: "string" },
      evidence: {
        type: "array",
        items: {
          type: "object",
          required: ["name", "url", "size", "type"],
          properties: {
            name: { type: "string" },
            fileName: { type: "string" },
            path: { type: "string" },
            url: { type: "string" },
            size: { type: "number" },
            type: { type: "string" },
            uploadedAt: { type: "string", format: "date-time" }
          }
        }
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      submittedAt: { type: "string", format: "date-time" },
      review: {
        type: ["object", "null"],
        properties: {
          reviewerId: { type: "string" },
          reviewedAt: { type: "string", format: "date-time" },
          feedback: { type: "string" }
        }
      },
      provenance: {
        type: "object",
        required: ["source", "protocolVersion", "experimentVersion"],
        properties: {
          source: { type: "string", enum: ["community"] },
          protocolVersion: { type: "string" },
          experimentVersion: { type: "string" }
        }
      }
    }
  },

  adminAuditLog: {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "AdminAuditLog",
    type: "object",
    required: ["action", "actorId", "targetSubmissionId", "previousStatus", "newStatus", "reason", "timestamp"],
    properties: {
      id: { type: "string" },
      action: { type: "string" },
      actorId: { type: "string" },
      targetSubmissionId: { type: "string" },
      previousStatus: { type: "string" },
      newStatus: { type: "string" },
      reason: { type: "string" },
      timestamp: { type: "string", format: "date-time" }
    }
  }
};

/**
 * Validates a submission's measurement map against an experiment's measurementSchema.
 * Disallows arbitrary or undefined keys, and validates bounds/types.
 */
export function validateSubmissionMeasurements(
  measurementSchema: MeasurementSchemaField[],
  measurements: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!measurements || typeof measurements !== 'object') {
    return { valid: false, errors: ['Measurements payload must be an object.'] };
  }

  const schemaMap = new Map<string, MeasurementSchemaField>();
  for (const field of measurementSchema) {
    schemaMap.set(field.key, field);
  }

  // 1. Check for unauthorized/injected keys outside measurementSchema
  for (const key of Object.keys(measurements)) {
    if (!schemaMap.has(key)) {
      errors.push(`Field '${key}' is not allowed in experiment protocol measurementSchema.`);
    }
  }

  // 2. Check required fields and type/bounds validation
  for (const field of measurementSchema) {
    const item = measurements[field.key];
    if (item === undefined || item === null) {
      if (field.required) {
        errors.push(`Missing required measurement field: '${field.label}' (${field.key}).`);
      }
      continue;
    }

    const val = typeof item === 'object' && item !== null && 'value' in item ? item.value : item;
    
    if (field.type === 'number') {
      const num = Number(val);
      if (isNaN(num)) {
        errors.push(`Measurement '${field.key}' must be a valid number.`);
      } else {
        if (field.min !== undefined && num < field.min) {
          errors.push(`Measurement '${field.key}' value ${num} is below minimum allowed ${field.min}.`);
        }
        if (field.max !== undefined && num > field.max) {
          errors.push(`Measurement '${field.key}' value ${num} exceeds maximum allowed ${field.max}.`);
        }
      }
    } else if (field.type === 'string') {
      if (typeof val !== 'string') {
        errors.push(`Measurement '${field.key}' must be a string.`);
      }
    } else if (field.type === 'boolean') {
      if (typeof val !== 'boolean') {
        errors.push(`Measurement '${field.key}' must be a boolean.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
