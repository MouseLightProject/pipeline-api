export enum QueueType {
    Local = 0,
    Cluster = 1
}

export enum PipelineWorkerStatus {
    Unavailable = 0,
    Connected,
    Idle,
    Processing
}

export interface IPipelineWorker {
    id?: string;
    worker_id?: string;
    name?: string;
    address?: string;
    port?: number;
    os_type?: string;
    platform?: string;
    arch?: string;
    release?: string;
    cpu_count?: number;
    total_memory?: number;
    free_memory?: number;
    load_average?: number;
    local_work_capacity?: number;
    cluster_work_capacity?: number;
    last_seen?: Date;
    status?: PipelineWorkerStatus;
    is_in_scheduler_pool?: boolean;
    local_task_load?: number;
    cluster_task_load?: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

export const TableName = "PipelineWorkers";

export function sequelizeImport(sequelize, DataTypes) {
    const _workerStatusMap = new Map<string, PipelineWorkerStatus>();
    const _workerLocalTaskLoadMap = new Map<string, number>();
    const _workerClusterTaskLoadMap = new Map<string, number>();

    const PipelineWorker = sequelize.define(TableName, {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        worker_id: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        name: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        address: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        port: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        os_type: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        platform: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        arch: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        release: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
        cpu_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_memory: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        free_memory: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        load_average: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        local_work_capacity: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        cluster_work_capacity: {
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        last_seen: {
            type: DataTypes.DATE
        },
        is_in_scheduler_pool: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.VIRTUAL,
            get() {
                let status = _workerStatusMap[this.id];

                if (!status) {
                    status = PipelineWorkerStatus.Unavailable;
                    _workerStatusMap[this.id] = status;
                }

                return status;
            },
            set(val) {
                _workerStatusMap[this.id] = val;
            }
        },
        local_task_load: {
            type: DataTypes.VIRTUAL,
            get() {
                let count = _workerClusterTaskLoadMap[this.id];

                if (count == null) {
                    count = -1;
                    _workerClusterTaskLoadMap[this.id] = count;
                }

                return count;
            },
            set(val) {
                _workerClusterTaskLoadMap[this.id] = val;
            }
        },
        cluster_task_load: {
            type: DataTypes.VIRTUAL,
            get() {
                let count = _workerLocalTaskLoadMap[this.id];

                if (count == null) {
                    count = -1;
                    _workerLocalTaskLoadMap[this.id] = count;
                }

                return count;
            },
            set(val) {
                _workerLocalTaskLoadMap[this.id] = val;
            }
        }
    }, {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true
    });

    PipelineWorker.getForWorkerId = async (workerIc: string): Promise<IPipelineWorker> => {
        let worker = await PipelineWorker.findOne({where: {worker_id: workerIc}});

        if (!worker) {
            worker = await PipelineWorker.create({worker_id: workerIc});
        }

        return worker;
    };

    return PipelineWorker;
}
