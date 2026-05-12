import { HydratedDocument, InferSchemaType, Schema, model } from 'mongoose';

const schemaCandidat = new Schema(
  {
    id: {
      type: Number,
      unique: true,
      index: true
    },
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true
    },
    prenom: {
      type: String,
      required: [true, 'Le prenom est requis'],
      trim: true
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true
    },
    telephone: {
      type: String,
      required: [true, 'Le telephone est requis'],
      trim: true
    },
    poste: {
      type: String,
      required: [true, 'Le poste est requis'],
      trim: true
    },
    annee_experience: {
      type: Number,
      required: [true, "L'annee d'experience est requise"],
      min: [0, "L'experience ne peut pas etre negative"]
    },
    competence: {
      type: [String],
      required: [true, 'Au moins une competence est requise'],
      default: []
    },
    statut: {
      type: String,
      enum: ['pending', 'interviewed', 'hired', 'rejected'],
      default: 'pending'
    },
    fichier: {
      type: String,
      default: null
    },
    commentaire: {
      type: String,
      default: null
    },
    est_supprime: {
      type: Boolean,
      default: false
    }
  },
  {
    id: false,
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        const serialized = ret as Record<string, unknown>;
        delete serialized._id;
        return ret;
      }
    }
  }
);

schemaCandidat.index({ est_supprime: 1, createdAt: -1 });

export type Candidat = InferSchemaType<typeof schemaCandidat>;
export type CandidatDocument = HydratedDocument<Candidat>;

export const CandidatModel = model('Candidat', schemaCandidat);
