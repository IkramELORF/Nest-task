import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity";
import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto;
        const user = new User();
        user.username = username;
        user.salt = await bcrypt.genSalt();
        user.password = await this.hashPassword(password, user.salt);
        try {
            await user.save();
        } catch (error) {
            if (error.code === '23505') { //duplicate username
                throw new ConflictException('username already exists');
            } else {
                throw new InternalServerErrorException();
            }
        }
    }
    
    async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string | null> {
        const { username, password } = authCredentialsDto;
        const user = await this.findOne({ where: { username } });

        if (user && await user.validatePassword(password)) {
            return user.username;
        }
        return null;
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }
    
}
