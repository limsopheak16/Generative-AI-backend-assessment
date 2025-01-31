import { Request, Response } from "express";
import { AppDataSource } from "../config";
import { Certificate } from "../entity/certificate.entity";
import { UserInfo } from "../entity/user.entity";
import { ollamaNoStream } from "../service/ollamaChat";
import { extractArrayCertifation } from "../utils/extractArray";

export const certificate = async (req: Request, res: Response) =>{
        // We got the goal from postman
    const {userId, courseName} = req.body;
    console.log("::UserID:" ,userId);
    console.log("Cousre name::::",courseName);
    // (certificateRepo , userInfoRepo)  we use to connect from the model
    const  certificateRepo = AppDataSource.getRepository(Certificate);
    const userInfoRepo = AppDataSource.getMongoRepository(UserInfo);

     // this line if not userId it's will return 404 message userID is required

    if (!userId) {
        return res.status(404).json({
            message: " Certificate is required"
        });
    }
    try{
        const user = await userInfoRepo.findOne ({ where:{id: req.user?.id}});
         // if not user it's will respons User not fonud

        if(!user){
            return res.status(404).json({
                message:"User not fonud"
            });
        }

        const newCertificate = new Certificate();
        newCertificate.user = userId;
        newCertificate.courseName = courseName;
        await certificateRepo.save(newCertificate);

        const query = `
              You are a helpful software development assistant. I want you to create a learning roadmap in the form of an array of objects. Each object should contain two properties: 
        
'title': A milestone or step in the roadmap.
'description': A detail (50 words) description of that step.

        Your response only be in this format without any other text outside of array
       [
             {
    "id": "987e6543-a21b-12d3-b456-426614174999",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "courseName": "JavaScript Basics",
    "createdAt": "2025-01-29T12:00:00.000Z"
}
       ]
       

        Now, create a ${userId}, ${courseName} certifacation.
        `
      const respones = await ollamaNoStream([{role: 'admin', content: query}]);
      const certificateArray = extractArrayCertifation(respones.message.content) ?? []
      console.log("::::::",certificateArray);
        
      return res.status(200).json({
        "Id": newCertificate.id,
        "UserID": newCertificate.user.id,
        "cousreName": newCertificate.courseName,
     });
    }catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
    
}

export const getAllCertificate = async (req: Request, res: Response) => {
    const certificateRepo = AppDataSource.getRepository(Certificate);

    try {
        // Fetch all roadmaps with their milestones
        const certificates = await certificateRepo.find({
            relations: ["certifficate"] // Ensure milestones are included
        });

        return res.status(200).json({
            message: "Certificate fetched successfully",
            certificates: certificates.map(certificate => ({
                id: certificate.user.id,
                courseName: certificate.courseName,
                createAt: certificate.createdAt
            }))
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
