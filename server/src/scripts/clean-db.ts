import { prisma } from '../config/db.js';

async function main() {
  console.log('=== Cleaning all dummy data from Database ===');

  try {
    // 1. Delete social & chat data
    await prisma.messageRead.deleteMany();
    await prisma.messageAttachment.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationMember.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.postCommentReply.deleteMany();
    await prisma.postComment.deleteMany();
    await prisma.postLike.deleteMany();
    await prisma.postMedia.deleteMany();
    await prisma.post.deleteMany();

    // 2. Delete transactions, orders, payouts
    await prisma.notification.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.farmerPayout.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.delivery.deleteMany();
    await prisma.pickupRequest.deleteMany();
    await prisma.qualityCheck.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.collectiveOrderMember.deleteMany();
    await prisma.collectiveOrder.deleteMany();
    await prisma.offerHistory.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.buyerDemand.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();

    // 3. Delete batches and mock users
    await prisma.productImage.deleteMany();
    await prisma.produceBatch.deleteMany();
    await prisma.collectionCenter.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.coordinatorProfile.deleteMany();
    await prisma.buyerProfile.deleteMany();
    await prisma.farmerProfile.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Successfully removed all dummy users, dummy posts, dummy batches, and dummy orders!');
    console.log('Current counts in database:');
    console.log('- Users:', await prisma.user.count());
    console.log('- Posts:', await prisma.post.count());
    console.log('- Batches:', await prisma.produceBatch.count());
    console.log('- Orders:', await prisma.order.count());
  } catch (err: any) {
    console.error('Error during cleanup:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
